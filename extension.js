const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */

function activate(context) {
	console.log('Congratulations, your extension "django-register-tags" is now active!');
	let boilerPlate = function(word) {
		// i know this looks awful but it seems to be the way VSCODE recognizes
		// the position to inject the string.
		return `

@admin.register(${word})
class ${word}Admin(admin.ModelAdmin):
	class Meta:
	    model = ${word}
	    fields = '__all__'\n`;
}

	let isAdminFile = function() {
		var currentFilePath = vscode.window.activeTextEditor.document.fileName;
		currentFilePath = currentFilePath.split('/') 
		currentFilePath = currentFilePath[currentFilePath.length-1]
		if (currentFilePath == "admin.py") return true
	}

	let hasModelsImports = function(afileText) {
		if (afileText.indexOf('from .models import') > 0) return true
	}

	let registerModel = vscode.commands.registerCommand('django-register-tags.registerModel', function () {
		var editor = vscode.window.activeTextEditor;
		var selection = editor.selection;
		var word = editor.document.getText(selection);
		if (isAdminFile()) {
			if (word) {
				// Add validation for model names (ie: first letter must be capitalized.)
				var lineCount = editor.document.lineCount;
				var position = new vscode.Position(lineCount, 0)
				editor.edit(editBuilder => {
					editBuilder.insert(position, boilerPlate(word))
				});
			};
		};

		vscode.window.showInformationMessage(boilerPlate);
	});

	let registerModels = vscode.commands.registerCommand('django-register-tags.registerModels', function () {
		var editor = vscode.window.activeTextEditor;
		var fileText = editor.document.getText();
		var codeToInject = "";
		var modelString = "";
		if (isAdminFile()) {
			if (hasModelsImports(fileText)) {
				fileText.splitLines().forEach((e) => {
					if (e.indexOf('.models') > 0) {
						var indexOfImport = e.indexOf('import') + 7;
						modelString = e.substring(indexOfImport, e.length);
						modelString = modelString.replace(/,+/g, '').split(' ');
						modelString.forEach((model) => {
							codeToInject += boilerPlate(model)
						});
						var lineCount = editor.document.lineCount;
						var position = new vscode.Position(lineCount, 0)
						editor.edit(editBuilder => {
							editBuilder.insert(position, codeToInject)
						});
					};
				});
			}
		}
		vscode.window.showInformationMessage(boilerPlate);
	});

	context.subscriptions.push(registerModels);

	let registerModelByField = vscode.commands.registerCommand('django-register-tags.registerModelByField', function () {
		var editor = vscode.window.activeTextEditor;
		var fileText = editor.document.getText();
		var currentFilePath = vscode.window.activeTextEditor.document.fileName;
		var modelsFilePath = currentFilePath.replace('admin', 'models');
		var openPath = vscode.Uri.file(modelsFilePath);
		vscode.workspace.openTextDocument(openPath).then(text => {
			vscode.window.showTextDocument(text);
		  });
	});

}
exports.activate = activate;

function deactivate() {}

module.exports = {
	activate,
	deactivate
}

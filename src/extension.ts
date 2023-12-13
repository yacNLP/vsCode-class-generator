import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand("extension.generateClass", () => {
        // Obtenir la liste des dossiers de travail ouverts dans VS Code
        const workspaceFolders = vscode.workspace.workspaceFolders;

        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage('No workspace folders are open.');
            return;
        }

        // Ouvrir une boîte de dialogue pour demander le nom de la classe
        vscode.window.showInputBox({ prompt: "Enter class name" }).then((className) => {
            if (!className) {
                return;
            }

            let folderPath = workspaceFolders[0].uri.fsPath;

            if (workspaceFolders.length > 1) {
                // Ouvrir une boîte de dialogue pour demander le dossier de destination
                vscode.window.showWorkspaceFolderPick({
                    placeHolder: "Select destination folder",
                }).then((selectedFolder) => {
                    if (selectedFolder) {
                        folderPath = selectedFolder.uri.fsPath;
                        generateClass(className, folderPath);
                    }
                });
            } else {
                generateClass(className, folderPath);
            }
        });
    }));
}

function generateClass(className: string, folderPath: string) {
    console.log("Folder path is", folderPath);

    const srcFolderPath = path.join(folderPath, "src");
    const filePath = path.join(srcFolderPath, `${className}.ts`);

    console.log("File Path:", filePath);

    if (!fs.existsSync(srcFolderPath)) {
        fs.mkdirSync(srcFolderPath);
    }

    const classContent = `
  export class ${className} {
    constructor() {
      // TODO: Implement constructor
    }

    getColor() {
      // TODO: Implement method
    }

    getName() {
      // TODO: implement method
    }
  }
  `;

    fs.writeFileSync(filePath, classContent);

    const uri = vscode.Uri.file(filePath);
    vscode.workspace.openTextDocument(uri).then((doc) => {
        vscode.window.showTextDocument(doc);
    });
}

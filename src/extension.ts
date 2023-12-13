import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { transformInterfaces } from "./generator/form/main";

export function activate(context: vscode.ExtensionContext) {
    // Register the command "extension.generateForm"
    context.subscriptions.push(vscode.commands.registerCommand("extension.generateForm", (uri) => {
        if (uri && uri.fsPath) {
            // Get the full path of the file or folder where you right-clicked
            const clickedPath = uri.fsPath;
            // If it's a directory, use it; otherwise, use the parent directory
            const folderPath = fs.statSync(clickedPath).isDirectory() ? clickedPath : path.dirname(clickedPath);
            // Call the function to transform interfaces in the clicked folder
            transformInterfaces(folderPath)
        } else {
            vscode.window.showErrorMessage('No valid folder selected.');
        }
    }));
}


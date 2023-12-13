import { Project, SourceFile } from "ts-morph";
import * as path from "path";
import { generateForm } from "./template-form-generator";
import * as fs from "fs";

export function transformInterfaces(sourceFolder: string) {
    console.log("Source folder path is", sourceFolder);
   

    // Create a new project
    const project = new Project();

    // Get the source files
    let sourceFiles: SourceFile[];
    const sourceStats = fs.statSync(sourceFolder);
    if (sourceStats.isFile()) {
        console.log("File");
        sourceFiles = [project.addSourceFileAtPath(sourceFolder)];
    } else {
        console.log("Folder");
        sourceFiles = project.addSourceFilesAtPaths(path.join(sourceFolder, "*.ts"));
    }

    // Loop through each TypeScript file in the source folder
    sourceFiles.forEach((sourceFile) => {
        console.log(`Processing Source file ${sourceFile.getFilePath()}`);

        // Analyze interfaces
        // Each interface will be morphed into a form
        sourceFile.getInterfaces().forEach((interfaceDeclaration) => {
            // Get the path of the original file
            const originalFilePath = sourceFile.getFilePath();
            
            // Create the "generated" folder in the source folder
            const generatedFolderPath = path.join(sourceFolder, "generated");
            if (!fs.existsSync(generatedFolderPath)) {
                fs.mkdirSync(generatedFolderPath);
            }

            const newFilePath = path.join(
                generatedFolderPath,
                interfaceDeclaration.getName() + "Form.tsx"
            );
            console.log('New file will be created at:', newFilePath);

            // Create the target form file
            let newSourceFile = project.getSourceFile(newFilePath);
            if (!newSourceFile) {
                newSourceFile = project.createSourceFile(newFilePath, "", {
                    overwrite: true,
                });
            }

            // Generate a string which is the form content
            const form = generateForm(
                path.basename(originalFilePath),
                interfaceDeclaration
            );
            console.log(form);

            // Insert the generated string into the form file
            newSourceFile.insertText(0, (writer) => writer.writeLine(form));

            // Quality
            newSourceFile.organizeImports();
            newSourceFile.fixMissingImports();
            newSourceFile.formatText();
        });

        // Save modifications
        project.saveSync();
    });

    console.log("Transformation terminée !");
}

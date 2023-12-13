# Nom de votre extension

Description courte de votre extension.

## Installation
1. Ouvrez Visual Studio Code.
2. Allez dans l'onglet Extensions (Ctrl + Shift + X).
3. Recherchez "Nom de votre extension" et cliquez sur "Installer".

## Utilisation
- Comment utiliser votre extension.

## Contribuer
- Des informations sur la façon dont les utilisateurs peuvent contribuer à votre extension.





# VSCode Extension: Form Generator

This Visual Studio Code (VSCode) extension simplifies the process of generating form files in TypeScript based on existing interfaces. It is particularly useful when working with TypeScript projects that involve form creation from interfaces.


## Features

    Form Generation: Automates the creation of form files (.tsx) from TypeScript interfaces.
    Template-Based: Utilizes templates to generate form content, allowing for customization and flexibility.
    Workspace Integration: Works seamlessly within your VSCode workspace.

## Installation

1. Download: Download the extension package (class-generator-yacine-0.0.1.vsix) from the project repository.

2. Install Extension:
        Open VSCode.
        Navigate to the Extensions view (Ctrl + Shift + X).
        Click on the three dots in the top-right corner and choose "Install from VSIX..."
        Select the downloaded VSIX file.

 ## Usage

1. Generate Form:
* Right-click on the folder or file in your workspace where you want to generate the form.
* Select the "Generate Form" option from the context menu.

2. Follow Prompts:
        If you clicked on a folder, it becomes the source folder. If you clicked on a file, the source folder is its parent directory.
        Choose the destination folder where the generated forms will be placed.

3. View Results:
        The extension processes the interfaces in the selected folder and creates corresponding form files.
        Check the VSCode output for progress updates and any potential errors.

4. Review Generated Forms:
        Open the generated forms in your workspace to review and make further adjustments if needed.

## Folder Structure

/project-root
│
├── out
├── src
│   ├── generator
│   │   └── form
│       ├── main.ts
│       ├── template-fields.ts
│       └── template-form-generator.ts
├── package.json
├── README.md
├── tsconfig.json

## Building the VSIX Package

To compile and generate the VSIX file:

    Open a terminal in the root of your project.

    Run the following command to install the necessary dependencies:

    bash

npm install

Build the project:

bash

npm run build

Package the extension into a VSIX file:

bash

    vsce package

    This command creates a .vsix file in the project root, which you can then distribute or use for installation.
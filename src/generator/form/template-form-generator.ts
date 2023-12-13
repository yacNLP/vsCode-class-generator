import { InterfaceDeclaration, Project, PropertySignature, ts } from "ts-morph";
import {
  AbstractTemplateField,
  MultipleBooleanFieldTemplate,
  MultipleDataFieldTemplate,
  MultipleEnumFieldTemplate,
  SingleBooleanFieldTemplate,
  SingleDataFieldTemplate,
  SingleDateFieldTemplate,
  SingleEnumFieldTemplate,
  SingleNumberFieldTemplate,
  SingleStringFieldTemplate,
  UnsupportedFieldTemplate,
} from "./template-fields";

export function generateForm(
  sourceFile: string,
  interfaceDeclaration: InterfaceDeclaration
): string {
  const interfaceName = interfaceDeclaration.getName();
  const templateFields = generateTemplateFields(
    sourceFile,
    interfaceDeclaration
  );
  return `import { 
      uuid,
      Form, 
      NumericField, 
      NumericFieldElements,
      TextFieldElements,
      TextField,
      DatePickerField,
      DatePickerFieldElements,
      CheckBoxField,
      CheckboxFieldElements,
      ReactFieldElements,
      ComboBoxField,
      ComboFieldElements,
      getProperty,
      setProperty,
      FormRef, 
      FormProps, 
      useForwardRef, 
      createForwardedFormRef, 
      FieldRef } from "@topaz/core";
    import {
        CollapsibleSection,
        SectionForm,
        SectionFormRef,
        TableField,
        TableFieldRef
    } from "@topaz/app";
    import React, { forwardRef, useRef } from "react";     
    import { SingleBooleanFieldTemplate, SingleEnumFieldTemplate, AbstractTemplateField } from './field-template.model';
  
    ${[
      ...new Set(
        templateFields
          .filter((templateField) => templateField.dataType)
          .flatMap((templateField) => templateField.imports())
          .filter((str) => str)
      ),
    ].join("\n")}
      
  
    export type ${interfaceName}FormRef = FormRef & {
      ${templateFields
        .map((templateField) => templateField.getter(true))
        .filter((str) => str)
        .join(";\n")}
    }


    
    export const ${interfaceName}Form = React.memo(forwardRef<
      ${interfaceName}FormRef, FormProps<${interfaceName}>>
        ((props, forwardRef) => {
            // create references
            const refForm = useRef<FormRef>();
            ${templateFields
              .flatMap((templateField) => templateField.refs())
              .filter((str) => str)
              .join("\n")}
    
    
            // expose the form api to the user        
            useForwardRef(forwardRef, {
                ...createForwardedFormRef(refForm),
                ${templateFields
                  .map((templateField) => templateField.getter(false))
                  .filter((str) => str)
                  .join(",\n")}
                // If a specialisation of the FormRef is used, then add the specific
            });
            const isEditing = props.isEditing ? props.isEditing : () => true;
            return (
                <Form
                    {...props}
                    id={"${interfaceName}Form"+props.uuid}
                    ref={refForm}
                    isEditing={isEditing}>
                    {/** Add fields*/}
                    ${templateFields
                      .map((templateField) => templateField.component())
                      .filter((str) => str)
                      .join("\n")}
                </Form >);
        }));`;
}

function generateTemplateFields(
  source: string,
  interfaceDeclaration: InterfaceDeclaration
): AbstractTemplateField[] {
  return interfaceDeclaration
    .getProperties()
    .map((property) => generateTemplateField(source, property))
    .filter((str) => str);
}

function generateTemplateField(
  source: string,
  property: PropertySignature
): AbstractTemplateField {
  const type = property.getType();
  if (type.isArray()) {
    const typeItem = type.getArrayElementType();

    if (typeItem!.isBoolean()) {
      return new MultipleBooleanFieldTemplate(source, property);
    } else if (typeItem!.isEnum()) {
      return new MultipleEnumFieldTemplate(source, property);
    } else if (typeItem!.isNumber()) {
      // TODO
    } else if (typeItem!.isString()) {
      // TODO
    } else if (typeItem!.isClassOrInterface()) {
      return new MultipleDataFieldTemplate(source, property);
    }
  } else {
    if (type.isBoolean()) {
      return new SingleBooleanFieldTemplate(source, property);
    } else if (type.isEnum() || type.getText(property).endsWith("Enum")) {
      return new SingleEnumFieldTemplate(source, property);
    } else if (type.isNumber()) {
      return new SingleNumberFieldTemplate(source, property);
    } else if (type.isString()) {
      return new SingleStringFieldTemplate(source, property);
    } else if (type.getText() === "Date") {
      return new SingleDateFieldTemplate(source, property);
    } else if (type.isClassOrInterface()) {
      return new SingleDataFieldTemplate(source, property);
    }
  }

  return new UnsupportedFieldTemplate(source, property);
}

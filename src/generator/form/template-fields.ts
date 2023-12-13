import { BodiedNode, PropertySignature, Type, ts } from "ts-morph";

export abstract class AbstractTemplateField {
  protected _descriptor: FieldDescriptor;
  public dataType: any;
  constructor(public source: string, protected _property: PropertySignature) {
    this._descriptor = getFieldDescriptor(_property);
  }
  abstract getter(isInterface: boolean): string | undefined;
  abstract refs(): string[];
  abstract component(): string;
  abstract imports(): string[];
}

/**
 * UnsupportedFieldTemplate
 */
export class UnsupportedFieldTemplate extends AbstractTemplateField {
  getter(isInterface: boolean): string | undefined {
    return undefined;
  }
  refs(): string[] {
    return [];
  }
  imports(): string[] {
    return [];
  }
  component(): string {
    return `{/** Not yet implemented: ${this._descriptor.field} ${this._property
      .getType()
      .getText(this._property)} */}\n TODO: ${
      this._descriptor.field
    } ${this._property.getType().getText(this._property)}`;
  }
}

/**
 * SingleBooleanFieldTemplate
 */
export class SingleBooleanFieldTemplate extends AbstractTemplateField {
  getter(isInterface: boolean): string | undefined {
    return genericGetter(
      this._property,
      isInterface,
      "FieldRef<CheckboxFieldElements<boolean>>"
    );
  }
  imports(): string[] {
    return [];
  }
  refs(): string[] {
    return [
      `const ${this._descriptor.fieldRef} = useRef<FieldRef<CheckboxFieldElements<boolean>>>(null);`,
    ];
  }
  component(): string {
    return `<CheckBoxField
    refForm={refForm}
    ref={${this._descriptor.fieldRef}}
    label='${this._descriptor.label}'
    field='${this._descriptor.field}'
    items={[true, false]}
    formater={(value) => (value ? 'True' : 'False')}
    isRadio
    ${this._descriptor.optional}/>`;
  }
}

/**
 * SingleEnumFieldTemplate
 */
export class SingleEnumFieldTemplate extends AbstractTemplateField {
  getter(isInterface: boolean): string | undefined {
    return genericGetter(
      this._property,
      isInterface,
      `FieldRef<ComboFieldElements<${this._property
        .getType()
        ?.getAliasSymbol()
        ?.getName()}>>`
    );
  }
  imports(): string[] {
    return [];
  }
  refs(): string[] {
    return [
      `const ${
        this._descriptor.fieldRef
      } = useRef<FieldRef<ComboFieldElements<${this._property
        .getType()
        ?.getAliasSymbol()
        ?.getName()}>>>(null);`,
    ];
  }
  component(): string {
    return `<ComboBoxField
    refForm={refForm}
    ref={${this._descriptor.fieldRef}}
    label='${this._descriptor.label}'
    field='${this._descriptor.field}'      
    options={Object.values(${this._property.getType().getText(this._property)})}
    ${this._descriptor.optional}/>`;
  }
}

/**
 * SingleNumberFieldTemplate
 */
export class SingleNumberFieldTemplate extends AbstractTemplateField {
  getter(isInterface: boolean): string | undefined {
    return genericGetter(
      this._property,
      isInterface,
      "FieldRef<NumericFieldElements>"
    );
  }
  imports(): string[] {
    return [];
  }
  refs(): string[] {
    return [
      `const ${this._descriptor.fieldRef} = useRef<FieldRef<NumericFieldElements>>(null);`,
    ];
  }
  component(): string {
    return `<NumericField
    refForm={refForm}
    ref={${this._descriptor.fieldRef}}
    label='${this._descriptor.label}'
    field='${this._descriptor.field}'
    ${this._descriptor.optional}/>`;
  }
}

/**
 * SingleStringFieldTemplate
 */
export class SingleStringFieldTemplate extends AbstractTemplateField {
  getter(isInterface: boolean): string | undefined {
    return genericGetter(
      this._property,
      isInterface,
      "FieldRef<TextFieldElements>"
    );
  }
  imports(): string[] {
    return [];
  }
  refs(): string[] {
    return [
      `const ${this._descriptor.fieldRef} = useRef<FieldRef<TextFieldElements>>(null);`,
    ];
  }
  component(): string {
    return `<TextField
    refForm={refForm}
    ref={${this._descriptor.fieldRef}}
    label='${this._descriptor.label}'
    field='${this._descriptor.field}'
    ${this._descriptor.optional}/>`;
  }
}

/**
 * SingleDateFieldTemplate
 */
export class SingleDateFieldTemplate extends AbstractTemplateField {
  getter(isInterface: boolean): string | undefined {
    return genericGetter(
      this._property,
      isInterface,
      "FieldRef<DatePickerFieldElements>"
    );
  }
  imports(): string[] {
    return [];
  }
  refs(): string[] {
    return [
      `const ${this._descriptor.fieldRef} = useRef<FieldRef<DatePickerFieldElements>>(null);`,
    ];
  }
  component(): string {
    return `<DatePickerField
    refForm={refForm}
    ref={${this._descriptor.fieldRef}}
    label='${this._descriptor.label}'
    field='${this._descriptor.field}'
    ${this._descriptor.optional}/>`;
  }
}

/**
 * SingleDataFieldTemplate
 */
export class SingleDataFieldTemplate extends AbstractTemplateField {
  constructor(source: string, property: PropertySignature) {
    super(source, property);
    this.dataType = this._descriptor.type.getText(this._property);
  }
  getter(isInterface: boolean): string | undefined {
    return genericGetter(
      this._property,
      isInterface,
      `${this.dataType}FormRef`
    );
  }
  imports(): string[] {
    return [
      `import {${this.dataType}Form,${this.dataType}FormRef} from "./${this.dataType}Form"; `,
    ];
  }
  refs(): string[] {
    const result = [
      `const ${this._descriptor.fieldRef} = useRef<${this.dataType}FormRef>(null);`,
    ];
    result.push(
      `const ${this._descriptor.fieldSectionRef} = useRef<SectionFormRef>(null);`
    );
    return result;
  }
  component(): string {
    return `<SectionForm
      refParent={refForm}
      ref={${this._descriptor.fieldSectionRef}}
      title={"${this._descriptor.field}"}
      get={() => getProperty(props.get(), "${this._descriptor.field}")}
      set={(obj) => setProperty(props.get(), "${this._descriptor.field}", obj)}
      ${
        this._descriptor.isOptional
          ? `onSwitchClick={() => ${this._descriptor.fieldRef}.current?.updateGui()}`
          : ""
      }
  >
    <${this.dataType}Form
      refParent={refForm}
      ref={${this._descriptor.fieldRef}}
      get={() => ${this._descriptor.fieldSectionRef}.current?.get() || {}}
      isEditing={isEditing}
      id={uuid()}
      context={props.context}
      ${this._descriptor.optional}
      />                
  </SectionForm>`;
  }
}

//
//
//
export type FieldDescriptor = {
  getter: string;
  type: Type<ts.Type>;
  field: string;
  fieldRef: string;
  fieldSectionRef: string;
  label: string;
  optional: string;
  isOptional: boolean;
};
function getFieldDescriptor(property: PropertySignature): FieldDescriptor {
  const field = property.getName();
  return {
    getter: `get${capitalizeFirstLetter(field)}`,
    type: property.getType(),
    field: field,
    fieldRef: `${field}Ref`,
    fieldSectionRef: `${field}SectionRef`,
    label: capitalizeFirstLetter(field),
    isOptional: property.getType().isNullable() || property.hasQuestionToken(),
    optional:
      property.getType().isNullable() || property.hasQuestionToken()
        ? ""
        : `validator={(value: unknown) => { return !value ? ['Le champ doit être valorisé'] : []; }}`,
  };
}

function capitalizeFirstLetter(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function genericGetter(
  property: PropertySignature,
  isInterface: boolean,
  returnType: string
): string | undefined {
  const descriptor = getFieldDescriptor(property);
  return getGetterSignature(
    isInterface,
    returnType,
    descriptor.fieldRef,
    descriptor.getter
  );
}
function getGetterSignature(
  isInterface: boolean,
  returnType: string,
  fieldRef: string,
  getter: string
) {
  if (!returnType) {
    return;
  } else if (!isInterface) {
    return `${getter}():${returnType} | undefined | null {return ${fieldRef}.current;}`;
  } else {
    return `${getter}():${returnType} | undefined  | null`;
  }
}

/**
 * SingleBooleanFieldTemplate
 */
export class MultipleBooleanFieldTemplate extends AbstractTemplateField {
  getter(isInterface: boolean): string | undefined {
    return genericGetter(
      this._property,
      isInterface,
      "FieldRef<CheckboxFieldElements<boolean>>"
    );
  }
  imports(): string[] {
    return [];
  }
  refs(): string[] {
    return [
      `const ${this._descriptor.fieldRef} = useRef<FieldRef<CheckboxFieldElements<boolean>>>(null);`,
    ];
  }
  component(): string {
    return `<CheckBoxField
    refForm={refForm}
    ref={${this._descriptor.fieldRef}}
    label='${this._descriptor.label}'
    field='${this._descriptor.field}'
    items={[true, false]}
    formater={(value) => (value ? 'True' : 'False')}
    ${this._descriptor.optional}/>`;
  }
}

/**
 * MultipleEnumFieldTemplate
 */
export class MultipleEnumFieldTemplate extends AbstractTemplateField {
  getter(isInterface: boolean): string | undefined {
    return genericGetter(
      this._property,
      isInterface,
      `FieldRef<CheckboxFieldElements<${this._property
        .getType()
        .getArrayElementType()
        ?.getAliasSymbol()
        ?.getName()}>>`
    );
  }
  imports(): string[] {
    return [];
  }
  refs(): string[] {
    return [
      `const ${
        this._descriptor.fieldRef
      } = useRef<FieldRef<CheckboxFieldElements<${this._property
        .getType()
        .getArrayElementType()
        ?.getAliasSymbol()
        ?.getName()}>>>(null);`,
    ];
  }
  component(): string {
    return `<CheckBoxField
    refForm={refForm}
    ref={${this._descriptor.fieldRef}}
    label='${this._descriptor.label}'
    field='${this._descriptor.field}'      
    items={Object.values(${this._property.getType().getText(this._property)})}
    ${this._descriptor.optional}/>`;
  }
}

/**
 * MultipleDataFieldTemplate
 */
export class MultipleDataFieldTemplate extends AbstractTemplateField {
  protected _detailRef: string | undefined;
  protected _detailType: string | undefined;
  protected _detailForm: string | undefined;
  constructor(source: string, property: PropertySignature) {
    super(source, property);
    this.dataType = this._property
      .getType()
      .getArrayElementType()
      ?.getText(property);
    const elementType = this._property.getType().getArrayElementType();
    if (
      elementType &&
      elementType.isClassOrInterface() &&
      elementType.getText() !== "Date"
    ) {
      this._detailRef = `${this._descriptor.field}DetailFormRef`;
      this._detailType = this.dataType;
      this._detailForm = `${this._detailType}Form`;
    }
  }

  imports(): string[] {
    return (
      (this._detailRef && [
        `import {${this.dataType}Form,${this.dataType}FormRef} from "./${this.dataType}Form"; `,
      ]) ||
      []
    );
  }
  getter(isInterface: boolean): string | undefined {
    return genericGetter(this._property, isInterface, `TableFieldRef`);
  }
  refs(): string[] {
    const result = [
      `const ${this._descriptor.fieldRef} = useRef<TableFieldRef>(null);`,
    ];
    if (this._detailRef) {
      result.push(
        `const ${this._detailRef} = useRef<${this._detailForm}Ref>(null);`
      );
    }
    return result;
  }
  component(): string {
    const elementType = this._property.getType().getArrayElementType();

    const columns = `[${elementType
      ?.getProperties()
      .map((property) => {
        const name = property.getName();
        return `{ title: "${name}", field: "${name}" }`;
      })
      .join(",")}]`;

    let result = `{/** TODO: Implement table for ${elementType?.getText()}*/}`;
    if (this._detailRef) {
      result = `<TableField    
    refForm={refForm}
    isEditing={isEditing}
    ref={${this._descriptor.fieldRef}}
    label='${this._descriptor.label}'
    field='${this._descriptor.field}'
    ${this._descriptor.optional}
    columns={${columns}}
    paginations={[5, 10, 20]}
    toolbarContent={isEditing() && <button className="add-button" onClick={() => {
      ${this._descriptor.fieldRef}.current?.createData({});
    }}></button> || undefined}
    useDetail={true}
    detailContent={(data) => {
      const detailUuid = uuid();
      return <${this._detailForm}
        key={detailUuid}
        refParent={refForm}
        ref={${this._detailRef}}
        get={() => data || {}}
        isEditing={isEditing}
        id={detailUuid}
        onEvent={() => {
          ${this._detailRef}.current?.updateModel();
          ${this._descriptor.fieldRef}.current?.getTable()?.refresh();
        }}
        onMount={(ref) => ref?.updateGui()}
    />;
    }}
    actions={() => [
    ... (isEditing() ? [{
      label: 'Remove', action: (e: any, row: any) => {
        ${this._descriptor.fieldRef}.current?.removeData((data) => row.getData()===data);
      }
    },
    {
      label: 'Create', action: (e: any, row: any) => {
        ${this._descriptor.fieldRef}.current?.createData({}, (data) => row.getData()===data);
      }
    }] : [])
  ]}
  />`;
    }

    return result;
  }
}

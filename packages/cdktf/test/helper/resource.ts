import { TerraformResource, TerraformMetaArguments } from "../../lib";
import { Construct } from "constructs";
import { TestProviderMetadata } from "./provider";
import { stringToTerraform } from "../../lib/runtime";
import { ComplexList, ComplexObject } from "../../lib/complex-computed-list";
import { ITerraformResource } from "../../lib/terraform-resource";

export interface TestResourceConfig extends TerraformMetaArguments {
  name: string;
  tags?: { [key: string]: string };
  nestedType?: { [key: string]: string };
}

export class TestResource extends TerraformResource {
  public static readonly tfResourceType: string = "test_resource";
  public name: string;
  public names?: string[];
  public tags?: { [key: string]: string };
  public nestedType?: { [key: string]: string };

  constructor(scope: Construct, id: string, config: TestResourceConfig) {
    super(scope, id, {
      terraformResourceType: "test_resource",
      terraformGeneratorMetadata: {
        providerName: TestProviderMetadata.TYPE,
        providerVersionConstraint: "~> 2.0",
      },
      provider: config.provider,
      dependsOn: config.dependsOn,
      count: config.count,
      lifecycle: config.lifecycle,
    });

    this.name = config.name;
    this.tags = config.tags;
    this.nestedType = config.nestedType;
  }

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      name: this.name,
      names: this.names,
      tags: this.tags,
      nested_type: this.nestedType,
    };
  }

  public get stringValue() {
    return this.getStringAttribute("string_value");
  }

  public get numericValue() {
    return this.getNumberAttribute("numeric_value");
  }

  public get listValue() {
    return this.getListAttribute("list_value");
  }

  public get anyList() {
    return this.interpolationForAttribute("any_list");
  }

  public get numberList() {
    return this.getNumberListAttribute("number_list_value");
  }
}

export class TestOutputReference extends ComplexObject {
  /**
   * @param terraformResource The parent resource
   * @param terraformAttribute The attribute on the parent resource this class is referencing
   */
  public constructor(
    terraformResource: ITerraformResource,
    terraformAttribute: string
  ) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get value() {
    return this.getStringAttribute("value");
  }
}

export class OtherTestResource extends TerraformResource {
  public static readonly tfResourceType: string = "other_test_resource";
  constructor(scope: Construct, id: string, config: TerraformMetaArguments) {
    super(scope, id, {
      terraformResourceType: "other_test_resource",
      terraformGeneratorMetadata: {
        providerName: TestProviderMetadata.TYPE,
        providerVersionConstraint: "~> 2.0",
      },
      provider: config.provider,
      dependsOn: config.dependsOn,
      count: config.count,
      lifecycle: config.lifecycle,
    });
  }

  public get names(): string[] {
    return this.getListAttribute("names");
  }

  public get complexComputedList() {
    return new TestComplexList(this, "complex_computed_list", false);
  }

  public get outputRef() {
    return new TestOutputReference(this, "outputRef");
  }

  protected synthesizeAttributes(): { [name: string]: any } {
    return {};
  }
}

class TestComplexObject extends ComplexObject {
  public get id() {
    return this.getStringAttribute("id");
  }
}

class TestComplexList extends ComplexList {
  public get(index: number): TestComplexObject {
    return new TestComplexObject(
      this.terraformResource,
      this.terraformAttribute,
      this.wrapsSet,
      index
    );
  }
}

// Generated Docker image to test real-world scenarios
export class DockerImage extends TerraformResource {
  public static readonly tfResourceType: string = "docker_image";
  private _name: string;
  public constructor(scope: Construct, id: string, config: { name: string }) {
    super(scope, id, {
      terraformResourceType: "docker_image",
      terraformGeneratorMetadata: {
        providerName: "docker",
      },
    });

    this._name = config.name;
  }

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      name: stringToTerraform(this._name),
    };
  }
}

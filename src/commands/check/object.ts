/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { writeFileSync, appendFileSync } from 'node:fs';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Connection, Messages } from '@salesforce/core';


Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-fieldcheck', 'check.object');

export type CheckObjectResult = {
  path: string;
};

export type SMetadataComponentDependency = {
MetadataComponentId: string; MetadataComponentName: string; MetadataComponentNamespace: string; MetadataComponentType: string; RefMetadataComponentId: string; RefMetadataComponentName: string; RefMetadataComponentNamespace: string; RefMetadataComponentType: string;

};

export default class CheckObject extends SfCommand<CheckObjectResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    name: Flags.string({
      summary: messages.getMessage('flags.name.summary'),
      description: messages.getMessage('flags.name.description'),
      char: 'n',
      required: false,
    }),
    'target-org': Flags.requiredOrg(),
  };


  public async run(): Promise<CheckObjectResult> {
    const { flags } = await this.parse(CheckObject);
    const con: Connection = flags['target-org'].getConnection('61.0');
    console.log('go');

   const data3 = await con.tooling.query('select Id,DeveloperName, TableEnumOrId from CustomField where TableEnumOrId = ' +'\'' + flags['name'] +'\'');
   console.log(data3);

   const ComponentType: string[] = new Array<string>();
   const MapFieldComponentType: Map<string,Set<string>> = new Map<string, Set<string>>();
    const MapFieldDetail: Map<string, SMetadataComponentDependency[]> = new Map<string, SMetadataComponentDependency[]>();
    for (const f of data3.records) {
      // eslint-disable-next-line no-await-in-loop
      const data2 = await con.tooling.query<SMetadataComponentDependency>('SELECT MetadataComponentId, MetadataComponentName, MetadataComponentNamespace, MetadataComponentType, RefMetadataComponentId, RefMetadataComponentName, RefMetadataComponentNamespace, RefMetadataComponentType from MetadataComponentDependency where refMetadataComponentId =' +'\'' + f.Id +'\'');
      for (const f2 of data2.records) {
        const fields = {MetadataComponentId: f2.MetadataComponentId, MetadataComponentName: f2.MetadataComponentName, MetadataComponentNamespace: f2.MetadataComponentNamespace, MetadataComponentType: f2.MetadataComponentType, RefMetadataComponentId:f2.RefMetadataComponentId, RefMetadataComponentName: f2.RefMetadataComponentName, RefMetadataComponentNamespace: f2.RefMetadataComponentNamespace, RefMetadataComponentType:f2. RefMetadataComponentType };
        if (MapFieldComponentType.has(f2.RefMetadataComponentId)) {
          MapFieldComponentType.get(f2.RefMetadataComponentId)?.add(f2.MetadataComponentType);
        } else {
          MapFieldComponentType.set(f2.RefMetadataComponentId,new Set<string>(f2.MetadataComponentType));
        }
        if (MapFieldDetail.has(f2.RefMetadataComponentId)) {
          MapFieldDetail.get(f2.RefMetadataComponentId)?.push(fields);
        } else {
          MapFieldDetail.set(f2.RefMetadataComponentId,[fields]);
        }
        if(!ComponentType.includes(f2.MetadataComponentType)) ComponentType.push(f2.MetadataComponentType);
      }
    }
    let sHeader = 'Object, RefMetadataComponentId, RefMetadataComponentName, RefMetadataComponentNamespace, RefMetadataComponentType';
    const sortedComponentType = ComponentType.sort();
    for (const fct of sortedComponentType) {
      sHeader += ',' + fct;
    }
    writeFileSync('output-summary.csv', sHeader);

    for (const ff of MapFieldComponentType.keys()) {
      let sRow = '\n' + flags['name'] + ',' +
          MapFieldDetail.get(ff)![0].RefMetadataComponentId + ',' +
          MapFieldDetail.get(ff)![0].RefMetadataComponentName + ',' +
          MapFieldDetail.get(ff)![0].RefMetadataComponentNamespace + ',' +
          MapFieldDetail.get(ff)![0].RefMetadataComponentType;

      const ct = MapFieldComponentType.get(ff) as Set<string>;
      for (const fct of sortedComponentType) {
        if (ct.has(fct)) {sRow += ',' + 'X';}
        else {sRow += ',' + '';}
      }
      appendFileSync('output-summary.csv', sRow);
    }

    const fullData: string[] = new Array<string>();
    for (const fparent of MapFieldDetail.values()) {
      for (const fdetail of fparent) {
        fullData.push(flags['name'] + ',' + fdetail.MetadataComponentId + ',' + fdetail.MetadataComponentName + ',' + fdetail.MetadataComponentNamespace + ',' + fdetail.MetadataComponentType + ',' + fdetail.RefMetadataComponentId + ',' + fdetail.RefMetadataComponentName + ',' + fdetail.RefMetadataComponentNamespace + ',' + fdetail.RefMetadataComponentType);
      }

    }
    const sHeader2 = 'Object, MetadataComponentId, MetadataComponentName, MetadataComponentNamespace, MetadataComponentType, RefMetadataComponentId, RefMetadataComponentName, RefMetadataComponentNamespace, RefMetadataComponentType' + '\n';
    writeFileSync('output-full.csv', sHeader2 + fullData.join('\n'));

    this.log ('Done');
    return {
      path: '/Users/ksmeets/Local/Projects/plugin-fieldcheck/src/commands/check/object.ts',
    };
  }
}

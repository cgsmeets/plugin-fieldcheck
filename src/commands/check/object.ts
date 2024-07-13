import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

Messages.importMessagesDirectory(dirname(fileURLToPath(import.meta.url)));
const messages = Messages.loadMessages('@salesforce/plugin-fieldcheck', 'check.object');

export type CheckObjectResult = {
  path: string;
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
  };

  public async run(): Promise<CheckObjectResult> {
    const { flags } = await this.parse(CheckObject);

    const name = flags.name ?? 'world';
    this.log(`hello ${name} from /Users/ksmeets/Local/Projects/plugin-fieldcheck/src/commands/check/object.ts`);
    return {
      path: '/Users/ksmeets/Local/Projects/plugin-fieldcheck/src/commands/check/object.ts',
    };
  }
}

import { TestContext } from '@salesforce/core/testSetup';
import { expect } from 'chai';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import CheckObject from '../../../src/commands/check/object.js'

describe('check object', () => {
  const $$ = new TestContext();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });

  afterEach(() => {
    $$.restore();
  });

  it('runs hello', async () => {
    await CheckObject.run([])
    const output = sfCommandStubs.log
      .getCalls()
      .flatMap((c) => c.args)
      .join('\n');
    expect(output).to.include('hello world');
  })

  it('runs hello with --json and no provided name', async () => {
    const result = await CheckObject.run([]);
    expect(result.path).to.equal('/Users/ksmeets/Local/Projects/plugin-fieldcheck/src/commands/check/object.ts');
  });

  it('runs hello world --name Astro', async () => {
    await CheckObject.run(['--name', 'Astro']);
    const output = sfCommandStubs.log
      .getCalls()
      .flatMap((c) => c.args)
      .join('\n');
    expect(output).to.include('hello Astro');
  });
});

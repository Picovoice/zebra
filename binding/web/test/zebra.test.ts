import { Zebra, ZebraWorker } from '../';
import testData from './test_data.json';

// @ts-ignore
import zebraParams from './params/zebra_params_en_fr';
import { PvModel } from '@picovoice/web-utils';
import { ZebraError } from '../src/zebra_errors';

const ACCESS_KEY = Cypress.env('ACCESS_KEY');
const DEVICE = Cypress.env('DEVICE');

const runInitTest = async (
  instance: typeof Zebra | typeof ZebraWorker,
  params: {
    accessKey?: string;
    model?: PvModel;
    device?: string;
    expectFailure?: boolean;
  } = {}
) => {
  const {
    accessKey = ACCESS_KEY,
    model = { publicPath: '/test/params/zebra_params_en_fr.pv', forceWrite: true },
    device = undefined,
    expectFailure = false,
  } = params;

  let isFailed = false;

  try {
    const zebra = await instance.create(accessKey, model, device);
    expect(zebra.maxCharacterLimit).to.be.greaterThan(0);
    expect(typeof zebra.version).to.eq('string');
    expect(zebra.version.length).to.be.greaterThan(0);

    if (zebra instanceof ZebraWorker) {
      zebra.terminate();
    } else {
      await zebra.release();
    }
  } catch (e) {
    if (expectFailure) {
      isFailed = true;
    } else {
      expect(e).to.be.undefined;
    }
  }

  if (expectFailure) {
    expect(isFailed).to.be.true;
  }
};

const runTranslationTest = async (
  instance: typeof Zebra | typeof ZebraWorker,
  source: string,
  text: string,
  target: string,
  translation: string,
  params: {
    accessKey?: string;
    model?: PvModel;
    device?: string;
  } = {}
) => {
  const {
    accessKey = ACCESS_KEY,
    model = { publicPath: `/test/params/zebra_params_${source}_${target}.pv`, forceWrite: true },
    device = DEVICE,
  } = params;

  try {
    const zebra = await instance.create(accessKey, model, device);

    const res = await zebra.translate(text);
    expect(res.replace("<pad> ", "").replace("</s>", "")).to.eq(translation);

    if (zebra instanceof ZebraWorker) {
      zebra.terminate();
    } else {
      await zebra.release();
    }
  } catch (e) {
    expect(e).to.be.undefined;
  }
};

describe('Zebra Binding', function () {
  it(`should return translate error message stack`, async () => {
    let error: ZebraError | null = null;

    const zebra = await Zebra.create(ACCESS_KEY, {
      publicPath: '/test/params/zebra_params_en_fr.pv',
      forceWrite: true,
    });
    // @ts-ignore
    const objectAddress = zebra._objectAddress;

    // @ts-ignore
    zebra._objectAddress = 0;

    try {
      await zebra.translate("Hello my name is");
    } catch (e) {
      error = e as ZebraError;
    }

    // @ts-ignore
    zebra._objectAddress = objectAddress;
    await zebra.release();

    expect(error).to.not.be.null;
    if (error) {
      expect((error as ZebraError).messageStack.length).to.be.gt(0);
      expect((error as ZebraError).messageStack.length).to.be.lte(8);
    }
  });

  it('List hardware devices', async () => {
    const hardwareDevices: string[] = await Zebra.listAvailableDevices();
    expect(Array.isArray(hardwareDevices)).to.be.true;
    expect(hardwareDevices).length.to.be.greaterThan(0);
  });

  for (const instance of [Zebra, ZebraWorker]) {
    const instanceString = instance === ZebraWorker ? 'worker' : 'main';

    it(`should return correct error message stack (${instanceString})`, async () => {
      let messageStack = [];
      try {
        const zebra = await instance.create('invalidAccessKey', {
          publicPath: '/test/params/zebra_params_en_fr.pv',
          forceWrite: true,
        });
        expect(zebra).to.be.undefined;
      } catch (e: any) {
        messageStack = e.messageStack;
      }

      expect(messageStack.length).to.be.gt(0);
      expect(messageStack.length).to.be.lte(8);

      try {
        const zebra = await instance.create('invalidAccessKey', {
          publicPath: '/test/params/zebra_params_en_fr.pv',
          forceWrite: true,
        });
        expect(zebra).to.be.undefined;
      } catch (e: any) {
        expect(messageStack.length).to.be.eq(e.messageStack.length);
      }
    });

    it(`should be able to init with public path (${instanceString})`, () => {
      cy.wrap(null).then(async () => {
        await runInitTest(instance);
      });
    });

    it(`should be able to init with base64 (${instanceString})`, () => {
      cy.wrap(null).then(async () => {
        await runInitTest(instance, {
          model: { base64: zebraParams, forceWrite: true },
        });
      });
    });

    it(`should be able to handle UTF-8 public path (${instanceString})`, () => {
      cy.wrap(null).then(async () => {
        await runInitTest(instance, {
          model: {
            publicPath: '/test/params/zebra_params_en_fr.pv',
            forceWrite: true,
            customWritePath: '테스트',
          },
        });
      });
    });

    it(`should be able to handle invalid public path (${instanceString})`, () => {
      cy.wrap(null).then(async () => {
        await runInitTest(instance, {
          model: { publicPath: 'invalid', forceWrite: true },
          expectFailure: true,
        });
      });
    });

    it(`should be able to handle invalid base64 (${instanceString})`, () => {
      cy.wrap(null).then(async () => {
        await runInitTest(instance, {
          model: { base64: 'invalid', forceWrite: true },
          expectFailure: true,
        });
      });
    });

    it(`should be able to handle invalid access key (${instanceString})`, () => {
      cy.wrap(null).then(async () => {
        await runInitTest(instance, {
          accessKey: 'invalid',
          expectFailure: true,
        });
      });
    });

    it(`should be able to handle invalid device (${instanceString})`, () => {
      cy.wrap(null).then(async () => {
        await runInitTest(instance, {
          device: 'invalid',
          expectFailure: true,
        });
      });
    });

    for (const testParam of testData.tests.translation_tests) {
      for (const [target, translation] of Object.entries(testParam.translations)) {
        it(`should be able to translate (${testParam.source}_${target}) (${instanceString})`, () => {
          try {
            cy.wrap(null).then(async () => {
              await runTranslationTest(
                instance,
                testParam.source,
                testParam.text,
                target,
                translation,
              );
            });
          } catch (e) {
            expect(e).to.be.undefined;
          }
        });
      }
    }
  }
});

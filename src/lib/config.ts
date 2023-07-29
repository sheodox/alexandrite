import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';
const boolDefaultTrue = (envVal?: string) => (envVal || 'true') === 'true';

export const config = {
	defaultInstance: env.ALEXANDRITE_DEFAULT_INSTANCE || 'lemmy.world',
	showWelcomeLemmyHelp: boolDefaultTrue(env.ALEXANDRITE_WELCOME_LEMMY_HELP),
	showWelcomeInstanceHelp: boolDefaultTrue(env.ALEXANDRITE_WELCOME_INSTANCE_HELP),
	forcedInstance: env.ALEXANDRITE_FORCE_INSTANCE?.trim() || ''
};

if (config.forcedInstance) {
	const bad = () => {
		if (browser) {
			alert(`ALEXANDRITE_FORCE_INSTANCE is set, but the instance "${config.forcedInstance}" isn't a valid host name!`);
			throw new Error('Invalid ALEXANDRITE_FORCE_INSTANCE configuration.');
		}
	};

	try {
		if (!/.+\..+/.test(config.forcedInstance)) {
			bad();
		}
		// try and parse the instance as a URL, if it fails that's a config error,
		new URL(`https://${config.forcedInstance}`);
	} catch (e) {
		// rethrow with a nicer error message
		bad();
	}
}

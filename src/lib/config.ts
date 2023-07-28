import { env } from '$env/dynamic/public';
const boolDefaultTrue = (envVal: string) => (envVal || 'true') === 'true';

export const config = {
	defaultInstance: env.ALEXANDRITE_DEFAULT_INSTANCE || 'lemmy.world',
	showWelcomeLemmyHelp: boolDefaultTrue(env.ALEXANDRITE_WELCOME_LEMMY_HELP),
	showWelcomeInstanceHelp: boolDefaultTrue(env.ALEXANDRITE_WELCOME_INSTANCE_HELP),
	forcedInstance: env.ALEXANDRITE_FORCE_INSTANCE || ''
};

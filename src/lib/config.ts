const boolDefaultTrue = (envVal: string) => (envVal || 'true') === 'true';

export const config = {
	defaultInstance: import.meta.env.ALEXANDRITE_DEFAULT_INSTANCE || 'lemmy.world',
	showWelcomeLemmyHelp: boolDefaultTrue(import.meta.env.ALEXANDRITE_WELCOME_LEMMY_HELP),
	showWelcomeInstanceHelp: boolDefaultTrue(import.meta.env.ALEXANDRITE_WELCOME_INSTANCE_HELP),
	forcedInstance: import.meta.env.ALEXANDRITE_FORCE_INSTANCE || ''
};

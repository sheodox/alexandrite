export function getInstanceFromRoute(pathname: string) {
	const match = pathname.match(/^\/([\w.]+)\b/);
	if (!match) {
		return null;
	}
	// needs to be something that includes a period, as these are domain names,
	// and thankfully no other routes include a period in them
	return match[1].includes('.') ? match[1] : null;
}

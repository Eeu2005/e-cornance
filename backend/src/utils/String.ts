import { randomUUID } from "node:crypto";

export function nameToSlug(name: string): string {
	const regex = /\s+|\.+|\/|\\/g;
	const slug: string = name.toLowerCase().replace(regex, "");
	return slug;
}
export const renameFile = (originalName: string) => {
	const split = originalName.split(".");
	const ext = split[split.length - 1];
	return `${nameToSlug(split[0])}${randomUUID().split("-")[0]}.original.${ext}`;
};

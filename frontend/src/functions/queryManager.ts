import { onBeforeUnmount, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

let isInitialized = false;
const queryState = ref<Record<string, string>>({});

/**
 * This state manager solves the problem that two `router.replace` calls (e.g. executed in a `watch` in separate `composables`)
 * might overwrite each other, as the current state of `route.query` is only updated after the `router.replace` promise is fulfilled.
 */
export function useQueryManager() {
	const router = useRouter();
	const route = useRoute();

	if (!isInitialized) {
		Object.assign(queryState.value, route.query);
		isInitialized = true;

		onBeforeUnmount(() => {
			queryState.value = {};
			isInitialized = false;
		});

		watch(
			() => route.query,
			(newQuery) => {
				Object.assign(queryState.value, newQuery);
			},
			{ immediate: true },
		);
	}

	const updateQuery = (updates:Record<string,string>) => {
		Object.keys(updates).forEach((key) => {
			if (
				updates[key] === undefined ||
				updates[key] === null ||
				updates[key] === ""
			) {
				delete queryState.value[key];
			} else {
				queryState.value[key] = updates[key];
			}
		});

		applyUpdates();
	};

	const applyUpdates = () => router.replace({ query: queryState.value });

	watch(queryState, applyUpdates, { deep: true });

	return { updateQuery };
}

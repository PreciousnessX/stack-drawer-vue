/* eslint-disable no-unused-expressions */
import { StackDrawerModel } from './types';

// function callHook(app: App, name: string) {
// console.log(app, name);
// if (typeof vm.$options[name] === 'function') {
// 	(vm.$options[name] as Function)();
// } else if (Array.isArray(vm.$options[name])) {
// 	(vm.$options[name] as Array<unknown>).forEach((fn) => {
// 		if (typeof fn === 'function') {
// 			try {
// 				fn.call(vm);
// 			} catch (error) {
// 				if ((error as any).stack) {
// 					console.error((error as any).stack);
// 				}
// 			}
// 		}
// 	});
// }
// vm.$children.forEach((m) => callHook(m, name));
// }

export function _destoryOne(model: StackDrawerModel) {
	const { vmWarp, app } = model;
	vmWarp?.remove();
	app?.unmount();
}

export function _destoryDrawer(models: StackDrawerModel[]) {
	models.forEach(_destoryOne);
}

export function _activate(model?: StackDrawerModel) {
	if (!model) return;
	if (model.activate.value) return;
	const { app } = model;
	if (!app) return;
	model.activate.value = true;
	// callHook(app, 'activated');
}

// 上一个deactivated
export function _deactivate(model?: StackDrawerModel) {
	if (!model) return;
	if (!model.activate.value) return;
	const { app } = model;
	if (!app) return;
	// callHook(app, 'deactivated');
	model.activate.value = false;
}

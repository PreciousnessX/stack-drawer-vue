import { h, createApp, provide } from 'vue';
import { sleep, capitalizeFirstLetter } from './utils';
import { StackDrawerModel, DOM_CLASS_LIST } from './types';

const transitionTimeOut = 600;

export const CUSTOM_WARP_ATTR = '__custom__warp__';

async function _invokTransition(
	$dom: HTMLElement,
	fromClass: string,
	toClass: string
) {
	$dom.classList.add(fromClass);
	await sleep();
	$dom.classList.add(toClass);

	await new Promise((resolve) => {
		const transitionEndFn = () => {
			$dom.removeEventListener('transitionend', transitionEndFn);
			$dom.classList.remove(fromClass);
			$dom.classList.remove(toClass);
			resolve(true);
		};

		setTimeout(() => {
			$dom.removeEventListener('transitionend', transitionEndFn);
			$dom.classList.remove(fromClass);
			$dom.classList.remove(toClass);
			resolve('transition time out');
		}, transitionTimeOut);

		$dom.addEventListener('transitionend', transitionEndFn);
	});
	return true;
}

export async function _enterTransition(model?: StackDrawerModel) {
	if (model) {
		const { vmWarp } = model;
		if (!vmWarp) return;
		return _invokTransition(
			vmWarp,
			DOM_CLASS_LIST.enterTransitionFromClass,
			DOM_CLASS_LIST.enterTransitionToClass
		);
	}
	return false;
}

export async function _leaveTransition(model?: StackDrawerModel) {
	if (model) {
		const { vmWarp } = model;
		if (!vmWarp) return;
		return _invokTransition(
			vmWarp,
			DOM_CLASS_LIST.leaveTransitionFromClass,
			DOM_CLASS_LIST.leaveTransitionToClass
		);
	}
	return false;
}

export function _apper(model: StackDrawerModel) {
	const { vmWarp } = model;
	if (!vmWarp) return;
	vmWarp.style.display = '';
}

// 消失
export function _disapper(model?: StackDrawerModel) {
	if (!model) return;
	const { vmWarp } = model;
	if (!vmWarp) return;
	vmWarp.style.display = 'none';
}

export function renderVm(model: StackDrawerModel, $warp: HTMLElement) {
	const { component, propsData, events, options } = model;

	const eventFns: { [key: string]: Function } = {};
	Object.keys(events).forEach((key) => {
		const eventName = `on${capitalizeFirstLetter(key)}`;
		// eslint-disable-next-line func-names
		eventFns[eventName] = function (...arg: any) {
			const fns = events[key];
			fns.forEach((fn) => {
				if ((<any>fn)._keep_emit || model.activate.value) {
					// 非活跃状态下不触发事件
					fn(...arg);
				}
			});
		};
	});

	const app = createApp({
		setup() {
			provide('drawerActivate', model.activate);
		},
		data: () => ({
			...propsData,
		}),
		render() {
			return h(component, {
				ref: 'drawerInstance',
				...this.$data,
				...eventFns,
			});
		},
	});

	const $vmWarp = document.createElement('div');
	$vmWarp.classList.add(DOM_CLASS_LIST.drawerMainClass);
	$vmWarp.style.display = 'none';

	if (options.width !== undefined) {
		$vmWarp.style.width = `${options.width}px`;
	}

	if (options.top !== undefined && !$warp.hasAttribute(CUSTOM_WARP_ATTR)) {
		$warp.style.top = `${options.top}px`;
		$warp.style.height = `calc(100% - ${options.top}px)`;
	}

	if (options.customClass) {
		$vmWarp.classList.add(options.customClass);
	}

	const vm = app.mount($vmWarp);

	model.app = app;
	model.vm = vm;
	model.vmWarp = $vmWarp;
	$warp.appendChild($vmWarp);
}

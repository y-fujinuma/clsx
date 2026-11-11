// @ts-check
/**
 * Edge cases not covered by the main test files.
 */
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import clsx from '../src';

test('(edge) handles substantially deeper nested arrays', () => {
	/** @type {unknown[]} */
	let nested = ['middle', { active:true }];
	for (let i = 0; i < 100; i++) {
		nested = [nested];
	}
	assert.is(clsx('before', nested, 'after'), 'before middle active after');
});

test('(edge) handles negative numbers, floats, and signed zero', () => {
	assert.is(clsx(-1, -0.5, 1.25, -0, 0), '-1 -0.5 1.25');
	assert.is(clsx([0, -0, -2, [NaN, -2.75, Infinity, -Infinity]]), '-2 -2.75 Infinity -Infinity');
});

test('(edge) ignores standalone booleans and nullish arguments', () => {
	assert.is(clsx(true), '');
	assert.is(clsx(false, true, null, undefined), '');
	assert.is(clsx(true, 'before', undefined, null, false, 'after', true), 'before after');
});

test('(edge) ignores nested nullish and empty values without extra separators', () => {
	assert.is(clsx([null, [undefined, ['', false, 0, NaN, [], {}]]]), '');
	assert.is(clsx('', [null, 'before', [undefined, '', 'after']], ''), 'before after');
});

test('(edge) skips holes in sparse arrays', () => {
	const values = new Array(5);
	values[1] = 'before';
	values[3] = [, 'after'];
	assert.is(clsx(values), 'before after');
	assert.is(clsx(new Array(5)), '');
});

test('(edge) enumerates integer-like object keys before other keys', () => {
	assert.is(clsx({ zebra:true, 10:true, 2:true, 0:true, '01':true, '-1':true, hidden:false }), '0 2 10 zebra 01 -1');
});

test('(edge) omits empty object keys without adding separators', () => {
	assert.is(clsx({ '':true }), '');
	assert.is(clsx({ '':true, before:true }, { '':true }, 'after'), 'before after');
});

test('(edge) preserves whitespace in strings and object keys', () => {
	assert.is(clsx(' before ', '\t', { 'after after':true }), ' before  \t after after');
});

test('(edge) preserves duplicate class names', () => {
	assert.is(clsx('same', ['same', { same:true }], 'same'), 'same same same same');
});

test('(edge) supports objects without a prototype', () => {
	const values = Object.create(null);
	values.before = true;
	values.hidden = false;
	values.after = 1;
	assert.is(clsx(values), 'before after');
});

test('(edge) includes inherited enumerable keys but not non-enumerable keys', () => {
	const values = Object.create({ inherited:true, ignored:false });
	values.own = true;
	Object.defineProperty(values, 'hidden', { value:true, enumerable:false });
	assert.is(clsx(values), 'own inherited');
});

test('(edge) ignores symbols as arguments, array elements, and object keys', () => {
	const key = Symbol('ignored');
	assert.is(clsx(key, ['before', key], { [key]:true, after:true }), 'before after');
});

test.run();

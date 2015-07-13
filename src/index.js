/* vim: set ts=4 sw=4 noet: */
import loaderUtils from 'loader-utils';
import glob from 'glob';

const quotedString = /(['"])(.*?)\1/;
const trailingSlash = /\/$/;

export default function importGlob(source) {
	this.cacheable();
	const options = loaderUtils.parseQuery(this.query);
	options.sync = true;

	let { test = "import", delimiter = '\n' } = options;
	const qualifier = new RegExp(`^.*\\b${test}\\b(.*)$`, 'gm');

	function expandGlob(result) {
		if (!result) return;
		const [match, quote, content] = result;
		const offset = result.index;
		const line = result.input;

		if (!glob.hasMagic(content)) return;

		let pre = line.slice(0, offset),
			post = line.slice(offset + match.length);

		options.cwd = this.context;
		const dirGlob = new glob.Glob(
			trailingSlash.test(content) ?  content : `${content}/`, options);

		dirGlob.found
		.forEach(directory => this.addContextDependency(directory));

		const fileOptions = Object.create(options);
		if (!options.hasOwnProperty('nodir')) {
			fileOptions.nodir = true;
		}
		fileOptions.cwd = this.context;
		fileOptions.cache = dirGlob.cache;
		fileOptions.statCache = dirGlob.statCache;

		return glob.sync(content, fileOptions)
		.map(filename => `${pre}${quote}${filename}${quote}${post}`)
		.join(delimiter);
	}

	function expandLine(line, payload) {
		if (!(payload && payload.trim())) return line;
		return expandGlob.call(this, quotedString.exec(line)) || line;
	}

	return source.replace(qualifier, expandLine.bind(this));
}

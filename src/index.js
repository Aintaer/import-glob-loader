import loaderUtils from 'loader-utils';
import glob from 'glob';

export default function importGlob(source) {
	const options = loaderUtils.parseQuery(this.query);
	let { test = "import", delimiter = ', ' } = options;
	const qualifier = new RegExp(`^.*\\b${test}\\b(.*)$`, 'gm');
	const context = this.context;

	function expandGlob(match, quote, content) {
		if (!glob.hasMagic(content)) return match;

		const opt = Object.create(options);
		opt.cwd = context;
		return glob.sync(content, opt)
		.map(filename => `${quote}${filename}${quote}`)
		.join(delimiter);
	}

	const quotedString = /(['"])(.*?)\1/g;
	function expandLine(line, payload) {
		if (!payload) return line;
		return line.replace(quotedString, expandGlob);
	}

	return source.replace(qualifier, expandLine);
}

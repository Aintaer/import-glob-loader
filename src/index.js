import loaderUtils from 'loader-utils';
import glob from 'glob';

export default function importGlob(source) {
	const options = loaderUtils.parseQuery(this.query);
	// Default nodir to true
	options.nodir = typeof options.nodir !== 'undefined' ? options.nodir : true;
	options.cwd = this.context;

	let { test = "import", delimiter = ', ' } = options;
	const qualifier = new RegExp(`^.*\\b${test}\\b(.*)$`, 'gm');

	function expandGlob(match, quote, content) {
		if (!glob.hasMagic(content)) return match;

		return glob.sync(content, options)
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

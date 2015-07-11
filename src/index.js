import loaderUtils from 'loader-utils';
import glob from 'glob';

export default function importGlob(source) {
	const options = loaderUtils.parseQuery(this.query);
	// Default nodir to true
	options.nodir = typeof options.nodir !== 'undefined' ? options.nodir : true;
	options.cwd = this.context;

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

		return glob.sync(content, options)
		.map(filename => `${pre}${quote}${filename}${quote}${post}`)
		.join(delimiter);
	}

	const quotedString = /(['"])(.*?)\1/;
	function expandLine(line, payload) {
		if (!(payload && payload.trim())) return line;
		return expandGlob(quotedString.exec(line)) || line;
	}

	return source.replace(qualifier, expandLine);
}

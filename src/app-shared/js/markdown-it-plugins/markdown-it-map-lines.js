// Markdown-it plugin intended to be used in the browser only – it doesn't have all the Browserify cruft,
// but follows the same browser conventions.

// Extend renderer rules to map source lines
window.markdownitMapLines = function(mdit) {
	"use strict";

	mdit.renderer.rules.paragraph_open = function(tokens, idx) {
		if (tokens[idx].lines) {
			return "<p id=\"line-start-"+ tokens[idx].lines[0] +"\" data-line-end=\""+ tokens[idx].lines[1] +"\">";
		}
		
		return "<p>";
	};

	mdit.renderer.rules.heading_open = function(tokens, idx) {
		if (tokens[idx].lines) {
			return "<h"+ tokens[idx].hLevel +" id=\"line-start-"+ tokens[idx].lines[0] +"\" data-line-end=\""+ tokens[idx].lines[1] +"\">";
		}

		return "<h"+ tokens[idx].hLevel +">";
	};

	mdit.renderer.rules.hr = function(tokens, idx) {
		if (tokens[idx].lines) {
			return "<hr id=\"line-start-"+ tokens[idx].lines[0] +"\" data-line-end=\""+ tokens[idx].lines[1] +"\" />\n";
		}

		return "<hr />\n";
	};

	// This is four spaced indended.
	mdit.renderer.rules.code_block = function(tokens, idx) {
		var code = tokens[idx].content;
		if (tokens[idx].lines) {
			return 	"<pre id=\"line-start-"+ tokens[idx].lines[0] +"\" data-line-end=\""+ tokens[idx].lines[1] +"\">"+
						"<code>"+ escapeHtml(code) +"</code>"+
					"</pre>\n";
		}

		return "<pre><code>"+ escapeHtml(code) +"</code></pre>\n";
	};

	// This is four backticks: ````....````.
	mdit.renderer.rules.fence = function(tokens, idx) {
		// Interpret each line as an ASCIIMath expression, and convert to LaTeX displayed equations.
		const asciimathparser = new window.AsciiMathParser();

		var code = tokens[idx].content;
		// Split, trim, remove empty lines, parse, wrap, and join.
		const processed = code.split(/\r?\n/)                 // Split by newlines.
							.map(line => line.trim())         // Trim whitespace.
							.filter(line => line !== "")      // Remove empty lines.
							.map(line => latexwrap(asciimathparser.parse(line)));   // Apply parse and wrap.
		return `\\[\\begin{align*}\n` + processed.join('\n') + `\n\\end{align*}\\]\n`;
	};

	function latexwrap(str) {
		// Find first occurance of \text{ and bump that to the next column.}
		const matchtxt = findtextindex(str, ['\\text{'], [`\\text{or}`, `\\text{and}`, `\\text{if}`]);
		if (matchtxt) {
			str = str.slice(0, matchtxt) + '& &' + str.slice(matchtxt)
		}
		// Find first occurance of equals, inequality etc. and bump rest to the next column.}
		const bracest = [`in`, `notin`, `subset`, `subseteq`, `supset`, `supseteq`,
						`leq`, `lt`, `le`, `geq`, `gt`,
						`preq`, `preqeq`, `succ`, `succeq`,
						`ne`, `neq`, `approx`, `equiv`, `propto`, `cong`,
						];
		const braces = [`=`].concat(bracest.flatMap(token => [`\\${token}{`, `\\${token} `]));
		const matcheq = findtextindex(str, braces);
		if (matcheq) {
			str = str.slice(0, matcheq) + '&' + str.slice(matcheq);
		} else {
			str = str + `&`;
		}
		return str + `\\\\`;
	};

	// Finds the first occurance of something in needle, which is _outside_ any braces, unless it's in without.
	function findtextindex(str, needle, without = []) {
		let braceDepth = 0;

		for (let i = 0; i < str.length; i++) {
			const ch = str[i];
			// Track brace nesting.
			if (ch === '{' || ch === '(' || ch === '[') {
				braceDepth++;
			continue;
			}
			if (str.startsWith('\\lbrace', i)) {
				braceDepth++;
				continue;
			}
			if (ch === '}' || ch === ')' || ch === ']') {
				braceDepth = Math.max(0, braceDepth - 1);
				continue;
			}
			if (str.startsWith('\\rbrace', i)) {
				braceDepth = Math.max(0, braceDepth - 1);
				continue;
			}

			// Only consider "needle", e.g. \text at top level.
			if (braceDepth === 0) {
				// Starts with one of the needles?
				const isIncluded = needle.some(
					token => str.startsWith(token, i)
				);
				if (!isIncluded) {
					continue;
				}
				// Check against excluded tokens.
				const isExcluded = without.some(
					token => str.startsWith(token, i)
				);
				if (!isExcluded) {
					return i;
				}
			}
		}
	return false;
	}

	mdit.renderer.rules.tr_open = function(tokens, idx) {
		if (tokens[idx].lines) {
			return "<tr id=\"line-start-"+ tokens[idx].lines[0] +"\" data-line-end=\""+ tokens[idx].lines[1] +"\">";
		}

		return "<tr>";
	};
};
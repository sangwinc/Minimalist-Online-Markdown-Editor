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
		const latexwrap = (s) => `\\[${s}\\]`;

		var code = tokens[idx].content;
		// Split, trim, remove empty lines, parse, wrap, and join.
		const processed = code.split(/\r?\n/)                 // Split by newlines.
							.map(line => line.trim())         // Trim whitespace.
							.filter(line => line !== "")      // Remove empty lines.
							.map(line => latexwrap(asciimathparser.parse(line)));   // Apply parse and wrap.
		return processed.join('\n');
	};

	mdit.renderer.rules.tr_open = function(tokens, idx) {
		if (tokens[idx].lines) {
			return "<tr id=\"line-start-"+ tokens[idx].lines[0] +"\" data-line-end=\""+ tokens[idx].lines[1] +"\">";
		}

		return "<tr>";
	};
};
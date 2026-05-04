(function() {
  window.TT = window.TT || {};

  window.TT.portCount = function(filename) {
    const m = filename.match(/\.s(\d+)p$/i);
    if (!m) throw new Error(`不明な拡張子: ${filename}`);
    return parseInt(m[1], 10);
  };

  window.TT.detectFmt = function(optionLine) {
    const tokens = optionLine.toUpperCase().split(/\s+/);
    for (const t of ['RI', 'DB', 'MA']) {
      if (tokens.includes(t)) return t;
    }
    throw new Error(`不明なフォーマット: ${optionLine}`);
  };

  window.TT.detectFreqUnit = function(optionLine) {
    const tokens = optionLine.toUpperCase().split(/\s+/);
    const map = { GHZ: 'GHz', MHZ: 'MHz', KHZ: 'kHz', HZ: 'Hz' };
    for (const t of ['GHZ', 'MHZ', 'KHZ', 'HZ']) {
      if (tokens.includes(t)) return map[t];
    }
    return 'Hz';
  };

  /**
   * Parse Touchstone 1.0 file.
   * Returns { comments, optionLine, inFmt, freqUnit, freqData }
   * freqData: Array of { freq, pairs: [a,b][] }  (n² pairs per freq point)
   */
  window.TT.parseTouchstone = function(content, n) {
    const nPairs = n * n;
    const valsPerFreq = 1 + 2 * nPairs;
    const comments = [];
    let optionLine = null;
    const rawVals = [];

    for (const raw of content.split(/\r?\n/)) {
      const stripped = raw.replace(/!.*$/, '').trim();
      if (raw.trimStart().startsWith('!')) { comments.push(raw.replace(/[\r\n]+$/, '')); continue; }
      if (!stripped) continue;
      if (stripped.startsWith('#')) { optionLine = stripped; continue; }
      for (const tok of stripped.split(/[\t ]+/)) {
        if (tok !== '') rawVals.push(parseFloat(tok));
      }
    }

    if (!optionLine) throw new Error('オプション行が見つかりません');
    if (rawVals.length % valsPerFreq !== 0) {
      throw new Error(`値数不正: ${rawVals.length} 値 (N=${n}, 期待: ${valsPerFreq} の倍数)`);
    }
    const inFmt = TT.detectFmt(optionLine);
    const freqUnit = TT.detectFreqUnit(optionLine);
    const freqData = [];
    for (let i = 0; i < rawVals.length; i += valsPerFreq) {
      const pairs = [];
      for (let j = 0; j < nPairs; j++) {
        pairs.push([rawVals[i + 1 + j * 2], rawVals[i + 2 + j * 2]]);
      }
      freqData.push({ freq: rawVals[i], pairs });
    }
    return { comments, optionLine, inFmt, freqUnit, freqData };
  };

  window.TT.csvPreamble = function(parsed) {
    return [...parsed.comments, parsed.optionLine];
  };

  window.TT.escHtml = function(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  };

  window.TT.fmt_size = function(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const MIN_DB = -999.999;

  /** [a, b] in inFmt → [re, im] */
  window.TT.toRI = function(a, b, inFmt) {
    if (inFmt === 'RI') return [a, b];
    const phaseRad = b * Math.PI / 180;
    const mag = inFmt === 'DB' ? (a <= -999 ? 0 : Math.pow(10, a / 20)) : a;
    return [mag * Math.cos(phaseRad), mag * Math.sin(phaseRad)];
  };

  /** [re, im] → [a, b] in outFmt */
  window.TT.fromRI = function(re, im, outFmt) {
    if (outFmt === 'RI') return [re, im];
    const mag   = Math.sqrt(re * re + im * im);
    const phase = Math.atan2(im, re) * 180 / Math.PI;
    if (outFmt === 'DB') return [mag === 0 ? MIN_DB : 20 * Math.log10(mag), phase];
    return [mag, phase];
  };
})();

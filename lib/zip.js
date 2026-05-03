(function() {
  const CRC_TABLE = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    CRC_TABLE[i] = c;
  }
  function crc32(bytes) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }
  function u16le(v) { return [(v & 0xFF), (v >> 8) & 0xFF]; }
  function u32le(v) { return [v & 0xFF, (v >> 8) & 0xFF, (v >> 16) & 0xFF, (v >> 24) & 0xFF]; }

  /** @param {{ name:string, data:string }[]} files @returns {Uint8Array} */
  window.TT = window.TT || {};
  window.TT.buildZip = function(files) {
    const enc = new TextEncoder();
    const parts = [];
    const central = [];
    let offset = 0;
    for (const f of files) {
      const name = enc.encode(f.name);
      const data = enc.encode(f.data);
      const crc  = crc32(data);
      const sz   = data.length;
      const lh   = new Uint8Array([
        0x50,0x4B,0x03,0x04, ...u16le(20), ...u16le(0), ...u16le(0),
        ...u16le(0), ...u16le(0), ...u32le(crc),
        ...u32le(sz), ...u32le(sz), ...u16le(name.length), ...u16le(0),
        ...name,
      ]);
      central.push({ name, crc, sz, offset });
      parts.push(lh, data);
      offset += lh.length + data.length;
    }
    const cdStart = offset;
    const cds = central.map(({ name, crc, sz, offset: off }) =>
      new Uint8Array([
        0x50,0x4B,0x01,0x02, ...u16le(20), ...u16le(20), ...u16le(0), ...u16le(0),
        ...u16le(0), ...u16le(0), ...u32le(crc),
        ...u32le(sz), ...u32le(sz), ...u16le(name.length),
        ...u16le(0), ...u16le(0), ...u16le(0), ...u16le(0), ...u32le(0), ...u32le(off),
        ...name,
      ])
    );
    const cdSize = cds.reduce((s, c) => s + c.length, 0);
    const eocd = new Uint8Array([
      0x50,0x4B,0x05,0x06, ...u16le(0), ...u16le(0),
      ...u16le(central.length), ...u16le(central.length),
      ...u32le(cdSize), ...u32le(cdStart), ...u16le(0),
    ]);
    const all = [...parts, ...cds, eocd];
    const total = all.reduce((s, a) => s + a.length, 0);
    const buf = new Uint8Array(total);
    let pos = 0;
    for (const a of all) { buf.set(a, pos); pos += a.length; }
    return buf;
  };
})();

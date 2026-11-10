// Every face is drawn from three cubic curves (two eyes, one mouth) so any two
// expressions can morph into each other smoothly.
export const FACES = {
  calm: {
    eyeL: 'M56 88 C66 84 76 84 86 88',
    eyeR: 'M114 88 C124 84 134 84 144 88',
    mouth: 'M88 124 C94 133 106 133 112 124',
  },
  happy: {
    eyeL: 'M54 96 C62 70 80 70 88 96',
    eyeR: 'M112 96 C120 70 138 70 146 96',
    mouth: 'M84 118 C92 142 108 142 116 118',
    cheeks: true,
  },
  love: {
    eyeL: 'M52 98 C60 64 80 64 88 98',
    eyeR: 'M112 98 C120 64 140 64 148 98',
    mouth: 'M86 116 C92 146 108 146 114 116',
    cheeks: true,
  },
  excited: {
    eyeL: 'M54 94 C62 66 80 66 88 94',
    eyeR: 'M112 94 C120 66 138 66 146 94',
    mouth: 'M88 118 C88 152 112 152 112 118',
    cheeks: true,
  },
  eat: {
    eyeL: 'M56 92 C66 76 76 76 86 92',
    eyeR: 'M114 92 C124 76 134 76 144 92',
    mouth: 'M90 120 C90 138 110 138 110 120',
  },
  sing: {
    eyeL: 'M54 96 C62 72 80 72 88 96',
    eyeR: 'M112 96 C120 72 138 72 146 96',
    mouth: 'M90 116 C90 144 110 144 110 116',
    cheeks: true,
  },
  listening: {
    eyeL: 'M54 92 C62 76 80 76 88 92',
    eyeR: 'M112 92 C120 76 138 76 146 92',
    mouth: 'M96 126 C98 133 102 133 104 126',
  },
  sad: {
    eyeL: 'M56 82 C66 84 76 88 86 92',
    eyeR: 'M144 82 C134 84 124 88 114 92',
    mouth: 'M88 134 C94 124 106 124 112 134',
  },
  sleepy: {
    eyeL: 'M56 86 C66 100 76 100 86 88',
    eyeR: 'M114 86 C124 100 134 100 144 88',
    mouth: 'M92 126 C96 130 104 130 108 126',
  },
  sleep: {
    eyeL: 'M56 88 C66 106 76 106 86 90',
    eyeR: 'M114 88 C124 106 134 106 144 90',
    mouth: 'M94 128 C97 134 103 134 106 128',
    extras: 'zzz',
  },
  hungry: {
    eyeL: 'M54 94 C60 62 82 62 88 94',
    eyeR: 'M112 94 C118 62 140 62 146 94',
    mouth: 'M88 128 C94 144 106 144 112 128',
  },
  hurt: {
    eyeL: 'M58 78 C68 82 76 90 84 98',
    eyeR: 'M142 78 C132 82 124 90 116 98',
    mouth: 'M90 130 C96 122 104 136 110 130',
  },
  annoyed: {
    eyeL: 'M58 88 C68 98 76 98 86 84',
    eyeR: 'M142 88 C132 98 124 98 114 84',
    mouth: 'M92 128 C96 123 104 123 108 128',
  },
  dizzy: {
    eyeL: 'M58 82 C70 74 72 98 86 92',
    eyeR: 'M142 82 C130 74 128 98 114 92',
    mouth: 'M88 128 C94 140 100 118 106 130',
  },
  focus: {
    eyeL: 'M56 90 C66 94 76 94 86 90',
    eyeR: 'M114 90 C124 94 134 94 144 90',
    mouth: 'M94 126 C98 130 102 130 106 126',
  },
};

export const CLOSED_EYES = {
  eyeL: 'M56 90 C66 95 76 95 86 90',
  eyeR: 'M114 90 C124 95 134 95 144 90',
};

// mouth shapes used while chewing / singing
export const MOUTH_CLOSED = {
  eat: 'M92 124 C96 130 104 130 108 124',
  sing: 'M92 122 C98 129 102 129 108 122',
};
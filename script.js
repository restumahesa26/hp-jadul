// --- NEW: Anti-Copy/Paste Measures ---
// Disable right-click menu
document.addEventListener('contextmenu', event => event.preventDefault());
// Disable DevTools shortcuts
document.addEventListener('keydown', function (e) {
	if (e.key === 'F12' || 
		(e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
		(e.ctrlKey && e.key === 'U')) {
		e.preventDefault();
	}
});
// --- Elemen DOM ---
const textInput = document.getElementById('textInput');
const resultDiv = document.getElementById('result');
const keys = document.querySelectorAll('.key');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');

// --- Peta Konversi ---
const keyMap = {
	'a': '2', 'b': '22', 'c': '222', 'd': '3', 'e': '33', 'f': '333',
	'g': '4', 'h': '44', 'i': '444', 'j': '5', 'k': '55', 'l': '555',
	'm': '6', 'n': '66', 'o': '666', 'p': '7', 'q': '77', 'r': '777', 's': '7777',
	't': '8', 'u': '88', 'v': '888', 'w': '9', 'x': '99', 'y': '999', 'z': '9999',
	' ': ' '
};

const keyCharacterMap = {
	'1': ['.', ',', '!', '1'], '2': ['a', 'b', 'c', '2'], '3': ['d', 'e', 'f', '3'],
	'4': ['g', 'h', 'i', '4'], '5': ['j', 'k', 'l', '5'], '6': ['m', 'n', 'o', '6'],
	'7': ['p', 'q', 'r', 's', '7'], '8': ['t', 'u', 'v', '8'], '9': ['w', 'x', 'y', 'z', '9'],
	'0': [' ']
};

// --- State untuk Multi-tap dan Kursor ---
let lastTappedKey = null;
let tapCounter = 0;
let tapTimeout = null;
let blinkInterval = null; // Variabel untuk interval kedip kursor

// --- Fungsi Kursor ---
function stopBlinking() {
	clearInterval(blinkInterval);
	blinkInterval = null;
	if (textInput.value.endsWith('|')) {
		textInput.value = textInput.value.slice(0, -1);
	}
}

function startBlinking() {
	stopBlinking(); // Hentikan kedipan sebelumnya
	textInput.value += '|'; // Tampilkan kursor segera
	blinkInterval = setInterval(() => {
		if (textInput.value.endsWith('|')) {
			textInput.value = textInput.value.slice(0, -1);
		} else {
			textInput.value += '|';
		}
	}, 500); // Kedip setiap 500ms
}

// --- Fungsi Konversi Angka ---
function convertTextToT9() {
	const currentText = textInput.value.replace('|', '').toLowerCase(); // Hapus kursor sebelum konversi
	let output = '';
	let lastKey = null;

	for (const char of currentText) {
		const mappedValue = keyMap[char];
		if (mappedValue) {
			if (char === ' ') {
				output += ' ';
				lastKey = null;
			} else {
				const currentKey = mappedValue[0];
				if (lastKey === currentKey) {
					output += '.';
				}
				output += mappedValue;
				lastKey = currentKey;
			}
		}
	}
	resultDiv.textContent = output;
}

// --- Fungsi untuk menangani penekanan keypad ---
function handleKeyPress(key) {
	stopBlinking(); // Hentikan kedipan dan hapus kursor sebelum memproses
	clearTimeout(tapTimeout);

	if (key === '#') { // Fungsi Hapus (Backspace)
		textInput.value = textInput.value.slice(0, -1);
		lastTappedKey = null;
		convertTextToT9();
		return;
	}

	const characters = keyCharacterMap[key];
	if (!characters) return;

	if (key === lastTappedKey) { // Menekan tombol yang sama lagi
		tapCounter++;
		const newChar = characters[tapCounter % characters.length];
		textInput.value = textInput.value.slice(0, -1) + newChar;
	} else { // Menekan tombol baru
		tapCounter = 0;
		const newChar = characters[0];
		textInput.value += newChar;
		lastTappedKey = key;
	}

	startBlinking(); // Mulai kedipan setelah karakter ditambahkan/diubah

	tapTimeout = setTimeout(() => {
		stopBlinking(); // Hentikan kedipan saat karakter "terkunci"
		lastTappedKey = null;
		tapCounter = 0;
	}, 1200);

	convertTextToT9();
}

// --- Event Listeners ---
// 1. Untuk input dari keyboard fisik
textInput.addEventListener('input', () => {
	stopBlinking();
	clearTimeout(tapTimeout);
	lastTappedKey = null;
	convertTextToT9();
});

// 2. Untuk klik pada keypad virtual
keys.forEach(keyElement => {
	keyElement.addEventListener('click', () => {
		const key = keyElement.getAttribute('data-key');
		handleKeyPress(key);
	});
});

// 3. Untuk tombol Hapus Semua
clearBtn.addEventListener('click', () => {
	stopBlinking();
	textInput.value = '';
	resultDiv.textContent = '';
	lastTappedKey = null;
	tapCounter = 0;
});

// 4. Untuk tombol Salin Angka
copyBtn.addEventListener('click', () => {
	const textToCopy = resultDiv.textContent;
	if (textToCopy) {
		const textArea = document.createElement('textarea');
		textArea.value = textToCopy;
		document.body.appendChild(textArea);
		textArea.select();
		try {
			document.execCommand('copy');
			copyBtn.textContent = 'Tersalin!';
			setTimeout(() => {
				copyBtn.textContent = 'Salin Angka';
			}, 1500);
		} catch (err) {
			console.error('Gagal menyalin teks: ', err);
			copyBtn.textContent = 'Gagal!';
				setTimeout(() => {
				copyBtn.textContent = 'Salin Angka';
			}, 1500);
		}
		document.body.removeChild(textArea);
	}
});
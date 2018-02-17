
function CompressorLZW()
{
	// do nothing
}

{
	// constants

	CompressorLZW.SymbolForBitWidthIncrease = 256;
	CompressorLZW.SymbolForBitStreamEnd = CompressorLZW.SymbolForBitWidthIncrease + 1;

	// instance methods

	CompressorLZW.prototype.compressBytes = function(bytesToCompress)
	{
		var bitStream = new BitStream();

		// Adapted from pseudocode found at the URL:
		// http://oldwww.rasip.fer.hr/research/compress/algorithms/fund/lz/lzw.html

		var symbolForBitWidthIncrease = CompressorLZW.SymbolForBitWidthIncrease;
		var symbolWidthInBitsCurrent = Math.ceil
		(
			Math.log(symbolForBitWidthIncrease + 1)
			/ BitStream.NaturalLogarithmOf2
		);

		var dictionary = this.initializeDictionary(8); // hack
		var pattern = "";

		for (var i = 0; i < bytesToCompress.length; i++)
		{
			var byte = bytesToCompress[i];
			var character = String.fromCharCode(byte);
			var patternPlusCharacter = pattern + character;
			var patternPlusCharacterEscaped = "_" + patternPlusCharacter;
			if (dictionary[patternPlusCharacterEscaped] == null)
			{
				var dictionaryIndex = dictionary.length;
				dictionary[patternPlusCharacterEscaped] = dictionaryIndex;
				dictionary[dictionaryIndex] = patternPlusCharacter;

				var patternEscaped = "_" + pattern;
				var patternEncoded = dictionary[patternEscaped];

				numberOfBitsRequired = Math.ceil
				(
					Math.log(patternEncoded + 1)
					/ BitStream.NaturalLogarithmOf2
				);

				if (numberOfBitsRequired > symbolWidthInBitsCurrent)
				{
					bitStream.writeNumber
					(
						symbolForBitWidthIncrease,
						symbolWidthInBitsCurrent
					);

					symbolWidthInBitsCurrent = numberOfBitsRequired;
				}

				bitStream.writeNumber
				(
					patternEncoded,
					symbolWidthInBitsCurrent
				);

				pattern = character;
			}
			else
			{
				pattern = patternPlusCharacter;
			}

		}

		var patternEscaped = "_" + pattern;
		var patternEncoded = dictionary[patternEscaped];
		bitStream.writeNumber
		(
			patternEncoded,
			symbolWidthInBitsCurrent
		);

		bitStream.writeNumber
		(
			CompressorLZW.SymbolForBitStreamEnd,
			symbolWidthInBitsCurrent
		);

		bitStream.close();

		return bitStream.bytes;
	}

	CompressorLZW.prototype.decompressBytes = function(bytesToDecode, symbolWidthInBitsInitial)
	{
		if (symbolWidthInBitsInitial == null)
		{
			throw "Missing argument!";
		}

		var stringDecompressed = "";

		// Adapted from pseudocode found at the URL:
		// http://oldwww.rasip.fer.hr/research/compress/algorithms/fund/lz/lzw.html

		var bitStream = new BitStream(bytesToDecode);

		var dictionary = this.initializeDictionary(symbolWidthInBitsInitial);
		var symbolForClear = dictionary.length - 2;
		var symbolForBitStreamEnd = symbolForClear + 1;
		var symbolForBitWidthIncrease = null; // symbolForClear + 2;
		symbolWidthInBitsCurrent = symbolWidthInBitsInitial + 1;

		var symbolToDecode;
		var symbolDecoded;
		var pattern = "";
		var character = "";
		var patternPlusCharacter = "";

		while (bitStream.hasMoreBits() == true)
		{
			var symbolNext = bitStream.readIntegerLE
			(
				symbolWidthInBitsCurrent
			);

			pattern = dictionary[symbolToDecode];
			if (pattern == null)
			{
				pattern = "";
			}

			if (symbolNext == symbolForClear)
			{
				var dictionary = this.initializeDictionary(symbolWidthInBitsInitial);
				symbolWidthInBitsCurrent = symbolWidthInBitsInitial + 1;
			}
			else if (symbolNext == symbolForBitWidthIncrease)
			{
				symbolWidthInBitsCurrent++;
			}
			else if (symbolNext == symbolForBitStreamEnd)
			{
				break;
			}
			else
			{
				symbolToDecode = symbolNext;
				symbolDecoded = dictionary[symbolToDecode];

				if (symbolDecoded == null)
				{
					character = pattern[0];
					patternPlusCharacter = pattern + character;
					stringDecompressed += patternPlusCharacter;
				}
				else
				{
					stringDecompressed += symbolDecoded;
					character = symbolDecoded[0];
					patternPlusCharacter = pattern + character;
				}

				var patternPlusCharacterEscaped = "_" + patternPlusCharacter;
				if (dictionary[patternPlusCharacterEscaped] == null)
				{
					var dictionaryIndex = dictionary.length;

					dictionary[patternPlusCharacterEscaped] = dictionaryIndex;
					dictionary[dictionaryIndex] = patternPlusCharacter;

					if (dictionaryIndex >= Math.pow(2, symbolWidthInBitsCurrent) - 1)
					{
						symbolWidthInBitsCurrent++;
					}
				}
			}
		}

		var bytesDecompressed = [];
		for (var i = 0; i < stringDecompressed.length; i++)
		{
			bytesDecompressed.push(stringDecompressed.charCodeAt(i));
		}

		return bytesDecompressed;
	}

	CompressorLZW.prototype.initializeDictionary = function(symbolWidthInBitsInitial)
	{
		var dictionary = [];

		var numberOfSymbolsInitial = Math.pow(2, symbolWidthInBitsInitial);
		var numberOfControlSymbols = 2; // 3;

		var numberOfSymbolsTotal = numberOfSymbolsInitial + numberOfControlSymbols;

		for (var i = 0; i < numberOfSymbolsTotal; i++)
		{
			var charCode = String.fromCharCode(i);
			var charCodeEscaped = "_" + charCode;
			dictionary[charCodeEscaped] = i;
			dictionary[i] = charCode;
		}

		return dictionary;
	}
}

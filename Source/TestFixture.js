
// tests

function TestFixture()
{
	// Test fixture class.
}
{
	TestFixture.prototype.bitFieldParseTest = function()
	{
		var byteBefore = 247;
		var bitStream = new BitStream([byteBefore]);
		var field0 = bitStream.readIntegerBE(1);
		var field1 = bitStream.readIntegerBE(2);
		var field2 = bitStream.readIntegerBE(3);
		var field3 = bitStream.readIntegerBE(2);

		bitStream = new BitStream([]);
		bitStream.writeIntegerBE(field0, 1);
		bitStream.writeIntegerBE(field1, 2);
		bitStream.writeIntegerBE(field2, 3);
		bitStream.writeIntegerBE(field3, 2);
		bitStream.close();
		var byteAfter = bitStream.bytes[0];

		if (byteBefore != byteAfter)
		{
			var error = "Expected: " + byteBefore + " Actual: " + byteAfter;
			throw error;
		}
		return true;
	}

	TestFixture.prototype.compressorTest = function()
	{
		var bytesToCompress = [1, 2, 3, 4, 5, 6, 7, 8];
		var compressor = new CompressorLZW();
		var bytesCompressed = compressor.compressBytes(bytesToCompress);
		var bytesDecompressed = compressor.decompressBytes(bytesCompressed, 8);
		var bytesToCompressAsString = bytesToCompress.join(",");
		var bytesDecompressedAsString = bytesDecompressed.join(",");
		if (bytesToCompressAsString != bytesDecompressedAsString)
		{
			throw "Test failed!";
		}
		return true;
	}
}

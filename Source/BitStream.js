
// classes

function BitStream(bytes)
{
	if (bytes == null)
	{
		bytes = [];
	}

	this.bytes = bytes;
	this.byteOffset = 0;
	this.bitOffsetWithinByte = 0;
	this.byteCurrent = 0;
}

{
	// constants

	BitStream.BitsPerByte = 8;
	BitStream.NaturalLogarithmOf2 = Math.log(2);

	// instance methods

	BitStream.prototype.close = function()
	{
		if (this.bitOffsetWithinByte > 0)
		{
			this.bytes.push(this.byteCurrent);
		}
	}

	BitStream.prototype.hasMoreBits = function()
	{
		var returnValue = (this.byteOffset < this.bytes.length - 1 || this.bitOffsetWithinByte < 8);
		return returnValue;
	}

	BitStream.prototype.readBitBE = function()
	{
		var byteCurrent = this.bytes[this.byteOffset];
		var bitOffsetReversed = 8 - this.bitOffsetWithinByte - 1;
		var returnValue = (byteCurrent >> bitOffsetReversed) & 1;

		this.bitOffsetWithinByte++;
		if (this.bitOffsetWithinByte >= 8)
		{
			this.bitOffsetWithinByte = 0;
			this.byteOffset++;
		}

		return returnValue;
	}

	BitStream.prototype.readBitLE = function()
	{
		var byteCurrent = this.bytes[this.byteOffset];
		var returnValue = (byteCurrent >> this.bitOffsetWithinByte) & 1;

		this.bitOffsetWithinByte++;
		if (this.bitOffsetWithinByte >= 8)
		{
			this.bitOffsetWithinByte = 0;
			this.byteOffset++;
		}

		return returnValue;
	}

	BitStream.prototype.readIntegerLE = function(numberOfBitsInInteger)
	{
		var returnValue = 0;

		for (var i = 0; i < numberOfBitsInInteger; i++)
		{
			var bitRead = this.readBitLE();
			var bitShifted = bitRead << i;
			returnValue |= bitShifted;
		}

		return returnValue;
	}

	BitStream.prototype.writeBitBE = function(bitToWrite)
	{
		var bitOffsetReversed = 8 - this.bitOffsetWithinByte - 1;
		var bitShifted = (bitToWrite << bitOffsetReversed); // todo
		this.byteCurrent |= bitShifted;

		this.bitOffsetWithinByte++;

		if (this.bitOffsetWithinByte >= BitStream.BitsPerByte)
		{
			this.bytes.push(this.byteCurrent);
			this.byteOffset++;
			this.bitOffsetWithinByte = 0;
			this.byteCurrent = 0;
		}
	}

	BitStream.prototype.writeBitLE = function(bitToWrite)
	{
		var bitShifted = (bitToWrite << this.bitOffsetWithinByte); // todo
		this.byteCurrent |= bitShifted;

		this.bitOffsetWithinByte++;

		if (this.bitOffsetWithinByte >= BitStream.BitsPerByte)
		{
			this.bytes.push(this.byteCurrent);
			this.byteOffset++;
			this.bitOffsetWithinByte = 0;
			this.byteCurrent = 0;
		}
	}

	BitStream.prototype.writeNumber = function(numberToWrite, numberOfBitsToUse)
	{
		for (var b = 0; b < numberOfBitsToUse; b++)
		{
			var bitValue = (numberToWrite >> b) & 1;
			this.writeBitLE(bitValue); // todo
		}
	}
}

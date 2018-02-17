
function ByteStream(bytes)
{
	this.bytes = bytes;
	this.byteOffset = 0;
}

{
	ByteStream.prototype.hasMoreBytes = function()
	{
		return (this.byteOffset < this.bytes.length);
	}

	ByteStream.prototype.readByte = function()
	{
		var returnValue = this.bytes[this.byteOffset];
		this.byteOffset++;
		return returnValue;
	}

	ByteStream.prototype.readBytes = function(numberOfBytesToRead)
	{
		var returnValues = [];

		for (var i = 0; i < numberOfBytesToRead; i++)
		{
			var byte = this.readByte();
			returnValues.push(byte);
		}

		return returnValues;
	}

	ByteStream.prototype.readInteger = function(numberOfBytesToRead)
	{
		var returnValue = 0;

		for (var i = 0; i < numberOfBytesToRead; i++)
		{
			var byte = this.readByte();
			returnValue |= byte << (8 * i); // little-endian
		}

		return returnValue;
	}

	ByteStream.prototype.readString = function(lengthOfString)
	{
		var returnValue = "";

		var bytes = this.readBytes(lengthOfString);

		for (var i = 0; i < bytes.length; i++)
		{
			var byte = bytes[i];
			returnValue += String.fromCharCode(byte);
		}

		return returnValue;
	}

	ByteStream.prototype.writeByte = function(byteToWrite)
	{
		this.bytes.push(byteToWrite);
		this.byteOffset++;
	}

	ByteStream.prototype.writeBytes = function(bytesToWrite)
	{
		for (var i = 0; i < bytesToWrite.length; i++)
		{
			this.writeByte(bytesToWrite[i]);
		}
	}

	ByteStream.prototype.writeInteger = function(value, numberOfBytesToWrite)
	{
		for (var i = 0; i < numberOfBytesToWrite; i++)
		{
			var byte = (value >> (8 * i)) & 0xff; // little-endian
			this.writeByte(byte);
		}
	}

	ByteStream.prototype.writeString = function(stringToWrite)
	{
		for (var i = 0; i < stringToWrite.length; i++)
		{
			this.writeByte(stringToWrite.charCodeAt(i));
		}
	}
}

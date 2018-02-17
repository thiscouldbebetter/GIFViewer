
function ImageFileGIF_Block_Image
(
	cornerNWPosInPixels,
	imageSizeInPixels,
	isInterlaced,
	localColorTable,
	symbolSizeInBits,
	symbols,
	subBlocks
)
{
	this.cornerNWPosInPixels = cornerNWPosInPixels;
	this.imageSizeInPixels = imageSizeInPixels;
	this.isInterlaced = isInterlaced;
	this.localColorTable = localColorTable;
	this.symbolSizeInBits = symbolSizeInBits;
	this.symbols = symbols;
	this.subBlocks = subBlocks;
}

{
	ImageFileGIF_Block_Image.BlockTypeCode = 0x2C; // ","

	ImageFileGIF_Block_Image.prototype.blockType = function()
	{
		return ImageFileGIF_Block_Image.BlockTypeCode;
	}

	// bytes

	ImageFileGIF_Block_Image.fromBytes = function(byteStream)
	{
		var cornerNWPosInPixels = new Coords
		(
			byteStream.readInteger(2),
			byteStream.readInteger(2)
		);

		var imageSizeInPixels = new Coords
		(
			byteStream.readInteger(2),
			byteStream.readInteger(2)
		);

		var packedFields = byteStream.readByte();

		var bitStream = new BitStream([packedFields]);

		var hasLocalColorTable = ( ( (packedFields >> 7) & 1) == 1);
		var isInterlaced = ( ( (packedFields >> 6) & 1) == 1);
		var areColorsSorted = ( ( (packedFields >> 5) & 1) == 1);
		// The next 2 bits of packedFields are "reserved".

		var localColorTable;

		if (hasLocalColorTable == true)
		{
			var numberOfColorsPowerMinusOne = (packedFields & 7);
			var numberOfColors = Math.pow(2, numberOfColorsPowerMinusOne + 1);

			localColorTable = ImageFileGIF_ColorTable.fromBytes
			(
				byteStream,
				0, // todo - colorResolution,
				areColorsSorted,
				numberOfColors
			);
		}
		else
		{
			localColorTable = null;
		}

		var symbolSizeInBits = byteStream.readByte();
		var symbols = [];

		var symbolClear = Math.pow(2, symbolSizeInBits);
		var symbolEnd = symbolClear + 1;

		var subBlocks = [];

		while (true)
		{
			var numberOfBytesInSubBlock = byteStream.readByte();

			if (numberOfBytesInSubBlock == 0)
			{
				break;
			}
			else
			{
				var subBlock = byteStream.readBytes
				(
					numberOfBytesInSubBlock
				);

				subBlocks.push(subBlock);
			}
		}

		var returnBlock = new ImageFileGIF_Block_Image
		(
			cornerNWPosInPixels,
			imageSizeInPixels,
			isInterlaced,
			localColorTable,
			symbolSizeInBits,
			symbols,
			subBlocks
		);

		return returnBlock;
	}

	ImageFileGIF_Block_Image.prototype.toBytes = function(byteStream)
	{
		byteStream.writeInteger(this.cornerNWPosInPixels.x, 2);
		byteStream.writeInteger(this.cornerNWPosInPixels.y, 2);

		byteStream.writeInteger(this.imageSizeInPixels.x, 2);
		byteStream.writeInteger(this.imageSizeInPixels.y, 2);

		var hasLocalColorTable = (this.localColorTable != null);

		var packedFields = 0;
		packedFields |= (hasLocalColorTable ? 1 : 0) << 7;
		packedFields |= (this.isInterlaced ? 1 : 0) << 6;
		packedFields |= (hasLocalColorTable ? (this.localColorTable.isSorted ? 1 : 0) : 0) << 5;
		// Next two bits are "reserved".

		if (this.localColorTable == null)
		{
			byteStream.writeByte(packedFields);
		}
		else
		{
			var localColorTable = this.localColorTable;
			var numberOfColorsPower = Math.round(Math.log(localColorTable.numberOfColors) / Math.log(2));
			packedFields |= (numberOfColorsPower - 1) << 0;
			byteStream.writeByte(packedFields);

			this.toBytes_Colors
			(
				byteStream,
				this.localColorTable
			);
		}

		byteStream.writeByte(this.symbolSizeInBits);

		for (var i = 0; i < this.subBlocks.length; i++)
		{
			var subBlock = this.subBlocks[i];
			var numberOfBytesInSubBlock = subBlock.length;
			byteStream.writeByte(numberOfBytesInSubBlock);
			if (numberOfBytesInSubBlock > 0)
			{
				byteStream.writeBytes(subBlock);
			}
		}

		byteStream.writeByte(0); // No more subBlocks.
	}

	// drawing

	ImageFileGIF_Block_Image.prototype.pixelsAsBytes = function()
	{
		var subBlocksConcatenated = [];
		for (var i = 0; i < this.subBlocks.length; i++)
		{
			var subBlock = this.subBlocks[i];
			subBlocksConcatenated = subBlocksConcatenated.concat
			(
				subBlock
			);
		}

		var compressorLZW = new CompressorLZW();

		var pixelsDecompressedAsBytes = compressorLZW.decompressBytes
		(
			subBlocksConcatenated,
			this.symbolSizeInBits
		);

		return pixelsDecompressedAsBytes;
	}
}

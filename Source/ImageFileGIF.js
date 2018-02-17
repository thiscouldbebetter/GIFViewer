
function ImageFileGIF
(
	filePath,
	gifType,
	logicalScreenSizeInPixels,
	backgroundColorIndex,
	aspectRatioType,
	globalColorTable,
	blocks
)
{
	this.filePath = filePath;
	this.gifType = gifType;
	this.logicalScreenSizeInPixels = logicalScreenSizeInPixels;
	this.backgroundColorIndex = backgroundColorIndex;
	this.aspectRatioType = aspectRatioType;
	this.globalColorTable = globalColorTable;
	this.blocks = blocks;
}

{
	// constants

	ImageFileGIF.GIFTypeStrings = [ "GIF87a", "GIF89a" ];

	// bytes

	ImageFileGIF.fromBytes = function(bytesFromFile)
	{
		var byteStream = new ByteStream(bytesFromFile);

		var gifType = byteStream.readString(6);
		if (ImageFileGIF.GIFTypeStrings.indexOf(gifType) == -1)
		{
			throw "Invalid GIF type code: " + gifType;
		}

		var logicalScreenSizeInPixels = new Coords
		(
			byteStream.readInteger(2),
			byteStream.readInteger(2)
		);

		var globalColorTableType = byteStream.readByte();

		var backgroundColorIndex = byteStream.readByte();
		var aspectRatioType = byteStream.readByte();

		var hasGlobalColorTable = ( ( (globalColorTableType >> 7) & 1 ) == 1);
		
		var globalColorTable = null;

		if (hasGlobalColorTable == true)
		{
			// Warning: 
			// The color table section of the GIF file spec at the URL
			// https://www.w3.org/Graphics/GIF/spec-gif89a.txt
			// is at best misleading and possibly erroneous.

			var colorResolution = ( (globalColorTableType >> 4) & 7) + 1;
			var areColorsSorted = ( ( (globalColorTableType >> 3) & 1) == 1);
			var colorTableSizePowerMinusOne = globalColorTableType & 7;
			var numberOfColors = Math.pow(2, colorTableSizePowerMinusOne + 1);

			globalColorTable = ImageFileGIF_ColorTable.fromBytes
			(
				byteStream,
				colorResolution, 
				areColorsSorted,
				numberOfColors
			);
		}

		var blocks = [];

		while (byteStream.hasMoreBytes() == true)
		{
			var block = ImageFileGIF.fromBytes_Block(byteStream);
			if (block != null)
			{
				blocks.push(block);
			}
		}

		var returnValue = new ImageFileGIF
		(
			"[from file]",
			gifType,
			logicalScreenSizeInPixels,
			backgroundColorIndex,
			aspectRatioType,
			globalColorTable,
			blocks
		);

		return returnValue;

	}

	ImageFileGIF.fromBytes_Block = function(byteStream)
	{
		var returnBlock = null;

		var blockType = byteStream.readByte();
		if (blockType == ImageFileGIF_Block_Image.BlockTypeCode)
		{
			returnBlock = ImageFileGIF_Block_Image.fromBytes(byteStream);
		}
		else if (blockType == ImageFileGIF_Block_Extension.BlockTypeCode)
		{
			returnBlock = ImageFileGIF_Block_Extension.fromBytes(byteStream);
		}
		else if (blockType == ImageFileGIF_Block_End.BlockTypeCode)
		{
			returnBlock = ImageFileGIF_Block_End.fromBytes(byteStream);
		}
		else
		{
			throw "Invalid block type code: " + blockType;
		}

		return returnBlock;
	}

	ImageFileGIF.prototype.toBytes = function()
	{
		var byteStream = new ByteStream([]);

		byteStream.writeString(this.gifType);

		byteStream.writeInteger(this.logicalScreenSizeInPixels.x, 2),
		byteStream.writeInteger(this.logicalScreenSizeInPixels.y, 2)

		var hasGlobalColorTable = (this.globalColorTable != null);
		var globalColorTableType = null;

		if (hasGlobalColorTable == true)
		{
			var globalColorTableBitfield = 0;
			globalColorTableBitfield |= (hasGlobalColorTable ? 1 : 0) << 7;
			globalColorTableBitfield |= (this.globalColorTable.colorResolution - 1) << 4;
			globalColorTableBitfield |= (this.globalColorTable.areColorsSorted ? 1 : 0) << 3;
			var numberOfColorsPower = Math.round
			(
				Math.log(this.globalColorTable.colors.length)
				/ Math.log(2)
			);
			globalColorTableBitfield |= (numberOfColorsPower - 1) << 0;

			globalColorTableType = globalColorTableBitfield;
		}
		else
		{
			globalColorTableType = 0; // todo
		}

		byteStream.writeByte(globalColorTableType);

		// It's frustrating that these two fields
		// don't come BEFORE the GCT stuff.
		byteStream.writeByte(this.backgroundColorIndex);
		byteStream.writeByte(this.aspectRatioType);

		if (hasGlobalColorTable == true)
		{
			this.globalColorTable.toBytes(byteStream);
		}

		for (var i = 0; i < this.blocks.length; i++)
		{
			var block = this.blocks[i];
			this.toBytes_Block(block, byteStream);
		}

		var returnValue = byteStream.bytes;

		return returnValue;
	}

	ImageFileGIF.prototype.toBytes_Block = function(block, byteStream)
	{
		var blockType = block.blockType();

		byteStream.writeByte(blockType);

		block.toBytes(byteStream);
	}

	// drawing

	ImageFileGIF.prototype.drawToGraphics = function(graphics)
	{
		var imageBlock;

		for (var i = 0; i < this.blocks.length; i++)
		{
			var block = this.blocks[i];
			if (block.blockType() == ImageFileGIF_Block_Image.BlockTypeCode)
			{
				imageBlock = block;
				break;
			}
		}

		var colorPalette = this.globalColorTable.colors;
		if (colorPalette == null)
		{
			colorPalette = imageBlock.localColorTable.colors;
		}

		var cornerNWPosInPixels = imageBlock.cornerNWPosInPixels;
		var imageSizeInPixels = imageBlock.imageSizeInPixels;
		var colorIndicesForPixels = imageBlock.pixelsAsBytes();

		for (var y = 0; y < imageSizeInPixels.y; y++)
		{
			for (var x = 0; x < imageSizeInPixels.x; x++)
			{
				var pixelIndex = y * imageSizeInPixels.x + x;
				var colorIndexForPixel = colorIndicesForPixels[pixelIndex];
				var colorComponentsRGB = colorPalette[colorIndexForPixel].componentsRGB;
				var colorAsStringRGB =
					"rgb("
					+ colorComponentsRGB[0] + ","
					+ colorComponentsRGB[1] + ","
					+ colorComponentsRGB[2]
					+ ")";
				graphics.fillStyle = colorAsStringRGB;
				graphics.fillRect
				(
					cornerNWPosInPixels.x + x,
					cornerNWPosInPixels.y + y,
					1, 1
				);
			}
		}
	}
}


function ImageFileGIF_Block_Extension
(
	extensionType,
	numberOfDataBytes,
	isThereATransparentBackgroundColor,
	delayForAnimation,
	indexForColorTransparent,
	endOfBlockFlag
)
{
	this.extensionType = extensionType;
	this.numberOfDataBytes = numberOfDataBytes;
	this.isThereATransparentBackgroundColor = isThereATransparentBackgroundColor;
	this.delayForAnimation = delayForAnimation;
	this.indexForColorTransparent = indexForColorTransparent;
	this.endOfBlockFlag = endOfBlockFlag;
}

{
	ImageFileGIF_Block_Extension.BlockTypeCode = 0x21; // "!"

	ImageFileGIF_Block_Extension.prototype.blockType = function()
	{
		return ImageFileGIF_Block_Extension.BlockTypeCode;
	}

	// bytes

	ImageFileGIF_Block_Extension.fromBytes = function(byteStream)
	{
		var returnValue = null;

		var extensionType = byteStream.readByte();

		if (extensionType == 0xF9) // graphic control
		{
			var numberOfDataBytes = byteStream.readByte();
			var isThereATransparentBackgroundColor = (byteStream.readByte() == 1);
			var delayForAnimation = byteStream.readInteger(2);
			var indexForColorTransparent = byteStream.readByte();

			var endOfBlockFlag = byteStream.readByte();

			returnValue = new ImageFileGIF_Block_Extension
			(
				extensionType,
				numberOfDataBytes,
				isThereATransparentBackgroundColor,
				delayForAnimation,
				indexForColorTransparent,
				endOfBlockFlag
			);
		}
		else
		{
			throw "Unrecognized extension block type!";
		}

		return returnValue;
	}

	ImageFileGIF_Block_Extension.prototype.toBytes = function(byteStream)
	{
		var extensionType = this.extensionType;
		byteStream.writeByte(extensionType);

		if (extensionType == 0xF9) // graphic control
		{
			byteStream.writeByte(this.numberOfDataBytes);
			byteStream.writeByte(this.isThereATransparentBackgroundColor ? 1 : 0);
			byteStream.writeInteger(this.delayForAnimation, 2);
			byteStream.writeByte(this.indexForColorTransparent);
			byteStream.writeByte(this.endOfBlockFlag);
		}
		else
		{
			throw "Unrecognized extension block type!";
		}
	}

}

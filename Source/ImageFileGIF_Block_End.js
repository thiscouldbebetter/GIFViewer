
function ImageFileGIF_Block_End()
{
	// todo
}

{
	ImageFileGIF_Block_End.BlockTypeCode = 0x3B; // ";"

	ImageFileGIF_Block_End.prototype.blockType = function()
	{
		return ImageFileGIF_Block_End.BlockTypeCode;
	}

	ImageFileGIF_Block_End.fromBytes = function()
	{
		return new ImageFileGIF_Block_End();
	}

	ImageFileGIF_Block_End.prototype.toBytes = function(byteStream)
	{
		// Do nothing.
	}
}


function Session()
{}
{
	Session.Instance = new Session();

	Session.prototype.imageFileGIF = function(value)
	{
		this.imageFileGIF = value;
		this.draw();
	}

	Session.prototype.draw = function()
	{
		var imageFileGIF = this.imageFileGIF;

		var blocks = imageFileGIF.blocks;
		for (var i = 0; i < blocks.length; i++)
		{
			var block = blocks[i];
			if (block.blockType() == ImageFileGIF_Block_Image.BlockTypeCode)
			{
				blockImage = block;
				break;
			}
		}

		var canvasSizeInPixels = blockImage.imageSizeInPixels;

		var canvas = document.createElement("canvas");
		canvas.width = canvasSizeInPixels.x;
		canvas.height = canvasSizeInPixels.y;

		var divImage = document.getElementById("divImage");
		divImage.appendChild(canvas);

		graphics = canvas.getContext("2d");

		graphics.strokeStyle = "Gray";
		graphics.strokeRect(0, 0, canvasSizeInPixels.x, canvasSizeInPixels.y);

		imageFileGIF.drawToGraphics(graphics);
	}
}

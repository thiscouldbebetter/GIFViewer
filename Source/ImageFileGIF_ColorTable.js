
function ImageFileGIF_ColorTable(colorResolution, areColorsSorted, colors)
{
	this.colorResolution = colorResolution; // Ignored?
	this.areColorsSorted = areColorsSorted;
	this.colors = colors;
}

{
	// bytes

	ImageFileGIF_ColorTable.fromBytes = function
	(
		byteStream, colorResolution, areColorsSorted, numberOfColors
	)
	{
		var colors = [];

		for (var i = 0; i < numberOfColors; i++)
		{
			var componentsForColor = byteStream.readBytes(3);
			var color = new Color(componentsForColor);
			colors.push(color);
		}

		var colorTable = new ImageFileGIF_ColorTable
		(
			colorResolution,
			areColorsSorted,
			colors
		);

		return colorTable;
	}

	ImageFileGIF_ColorTable.prototype.toBytes = function(byteStream)
	{
		for (var i = 0; i < this.colors.length; i++)
		{
			var color = this.colors[i];
			var colorComponents = color.componentsRGB;
			byteStream.writeBytes(colorComponents);
		}
	}
}

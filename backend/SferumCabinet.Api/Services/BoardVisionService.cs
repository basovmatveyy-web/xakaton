using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;

namespace SferumCabinet.Api.Services;

public class BoardVisionService
{
    public byte[] InvertChalkboardToWhiteSheet(byte[] inputImageBytes)
    {
        using var image = Image.Load<Rgba32>(inputImageBytes);

        // 1. Resize if image is huge to optimize speed
        if (image.Width > 2000 || image.Height > 2000)
        {
            image.Mutate(x => x.Resize(new ResizeOptions
            {
                Size = new Size(1600, 1600),
                Mode = ResizeMode.Max
            }));
        }

        // 2. Grayscale, Invert (so chalk becomes ink, black board becomes white page), and Boost Contrast
        image.Mutate(x =>
        {
            x.Grayscale();
            x.Invert();
            x.Contrast(1.45f);
            x.Brightness(1.15f);
        });

        // 3. Save to output memory stream as high-quality JPEG
        using var outputMs = new MemoryStream();
        image.SaveAsJpeg(outputMs);
        return outputMs.ToArray();
    }
}

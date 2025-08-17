import { COLOR } from "constants/colors";
import fileService from "services/file";

export const canvasService = {
  rect: (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    fill: string,
  ) => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y);
    ctx.lineTo(x + width, y + height);
    ctx.quadraticCurveTo(x + width, y + height, x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height);
    ctx.lineTo(x, y);
    ctx.quadraticCurveTo(x, y, x, y);
    ctx.closePath();

    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.restore();
    }
  },
  coords: (canvas: HTMLCanvasElement, coords: string[]) => {
    const ctx: CanvasRenderingContext2D = canvas.getContext(
      "2d",
    ) as CanvasRenderingContext2D;

    /** Draw coordinates block */
    /** There are 5 strings with time */
    const blockHeight: number = coords.length === 5 ? 80 : 65;
    const blockMargin: number = 5;
    const blockY: number = canvas.height - (blockHeight + blockMargin);
    let blockWidth: number = 135;

    const textX: number = 10;

    /** Calculate block width */
    coords.forEach((string) => {
      const textWidth = ctx.measureText(string).width;

      if (textWidth > blockWidth - 10) {
        blockWidth = textWidth + 10;
      }
    });

    /** Increase canvas size if not enough space */
    if (blockWidth > canvas.width) {
      canvas.width = blockWidth + 5; // 5 is right padding
    }

    canvasService.rect(
      ctx,
      blockMargin,
      blockY,
      blockWidth,
      blockHeight,
      COLOR.WHITE_08,
    );

    /** Draw geo info */
    ctx.font = "10px sans-serif";
    ctx.fillStyle = COLOR.BLACK;
    coords.forEach((string, index) => {
      ctx.fillText(string, textX, blockY + 12 + index * 15);
    });
  },
  crosshair: (canvas: HTMLCanvasElement, image: HTMLImageElement) => {
    const ctx: CanvasRenderingContext2D = canvas.getContext(
      "2d",
    ) as CanvasRenderingContext2D;
    const crosshairSize = 50;
    const centerY = image.height / 2;
    const centerX = image.width / 2;

    ctx.strokeStyle = COLOR.RED;
    ctx.beginPath();
    ctx.moveTo(centerX - crosshairSize / 2, centerY);
    ctx.lineTo(centerX + crosshairSize / 2, centerY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX, centerY - crosshairSize / 2);
    ctx.lineTo(centerX, centerY + crosshairSize / 2);
    ctx.stroke();
  },
  toFile: (
    canvas: HTMLCanvasElement,
    name: string,
    callback: (file: File) => void,
  ) => {
    canvas.toBlob((blob: Blob | null) => {
      if (blob) {
        const file = new File(
          [blob],
          fileService.changeExtension(name, "png"),
          { type: "image/png" },
        );
        callback(file);
      }
    }, "image/png");
  },
};

import { Injectable } from '@nestjs/common';
import { createCanvas } from 'canvas';
import { BACKGROUND_COLORS } from './avatar.constants';
import { getRandomItem } from 'src/utils';

@Injectable()
export class AvatarService {
  async generateAvatar(firstName: string, lastName: string): Promise<Buffer> {
    const initials = `${firstName[0]}${lastName[0]}`.toUpperCase();

    const canvas = createCanvas(50, 50);
    const ctx = canvas.getContext('2d');

    const randomBackgroundColor = getRandomItem(BACKGROUND_COLORS);

    ctx.fillStyle = randomBackgroundColor;

    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, canvas.width / 2, canvas.height / 2);

    return canvas.toBuffer('image/png');
  }
}

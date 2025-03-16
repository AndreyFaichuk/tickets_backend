import { CookieService } from 'src/cookie/cookie.service';
import { CustomException } from 'src/exceptions/customExeption.exeption';
import { HttpStatus } from '@nestjs/common';

const customInvalidCookieException = new CustomException(
  'Invalid or expired session',
  HttpStatus.UNAUTHORIZED,
);

const customExpiredCookieException = new CustomException(
  'Expired session',
  HttpStatus.UNAUTHORIZED,
);

export const mockInvalidSession = (cookieService: CookieService) => {
  jest.spyOn(cookieService, 'validateCookie').mockImplementation(() => {
    throw customInvalidCookieException;
  });
};

export const mockExpiredSession = (cookieService: CookieService) => {
  jest.spyOn(cookieService, 'validateCookie').mockImplementation(() => {
    throw customExpiredCookieException;
  });
};

export const expectInvalidSession = async (fn: () => Promise<any>) => {
  await expect(fn()).rejects.toThrow(customInvalidCookieException);
};

export const expectExpiredSession = async (fn: () => Promise<any>) => {
  await expect(fn()).rejects.toThrow(customExpiredCookieException);
};

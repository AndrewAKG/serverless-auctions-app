import createError from 'http-errors';
import { getEndedAuctions } from '../lib/getEndedAuctions';
import { closeAuction } from '../lib/closeAuction';

const processAuctions = async (event, context) => {
  try {
    const auctionsToClose = await getEndedAuctions();
    const closePromises = auctionsToClose.map((auction) =>
      closeAuction(auction)
    );
    await Promise.all(closePromises);

    return { closed: closePromises.length };
  } catch (e) {
    console.error(e);
    throw new createError.InternalServerError(e);
  }
};

export const handler = processAuctions;

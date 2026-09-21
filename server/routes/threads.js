
import { Router } from "express";
import prisma from "../prisma/client.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    // 1. Get page from query string
    // Example: /threads?page=2
    const page = Number(req.query.page) || 1;

    // 2. Number of threads per page
    const pageSize = 10;

    // 3. Calculate how many records to skip
    const skip = (page - 1) * pageSize;

    // 4. Take only 10 threads
    const take = pageSize;

    // 5. Get threads AND total count at the same time
    const [threads, total] = await Promise.all([
      prisma.thread.findMany({
        skip,
        take,

        orderBy: {
          createdAt: "desc",
        },

        include: {
          author: {
            select: {
              name: true,
              avatarUrl: true,
            },
          },

          _count: {
            select: {
              comments: true,
            },
          },
        },
      }),

      prisma.thread.count(),
    ]);

    // 6. Check if another page exists
    const hasMore = total > page * pageSize;

    // 7. Send response
    res.json({
      threads,
      total,
      hasMore,
    });
  } catch (error) {
    next(error);
  }
});

export default router;


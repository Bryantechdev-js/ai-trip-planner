import { mutation, query } from '@/convex/_generated/server'
import { v } from 'convex/values'

export const CreateNewUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    // if user already exist
    const existingUser = await ctx.db
      .query('UserTable')
      .filter(q => q.eq(q.field('email'), args.email))
      .collect()
    if (existingUser.length == 0) {
      const userData = {
        name: args.name,
        email: args.email,
        imageUrl: args.imageUrl,
      }

      // if not then create a new user
      const result = await ctx.db.insert('UserTable', userData)
      return await ctx.db.get(result)
    }
    return existingUser[0]
  },
})

export const getUserById = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('UserTable')
      .filter(q => q.eq(q.field('email'), args.userId))
      .first()
    return user
  },
})

export const updateUserSubscription = mutation({
  args: {
    userId: v.string(),
    subscription: v.string(),
    dueDate: v.number(),
    paymentDetails: v.optional(
      v.object({
        planId: v.string(),
        amount: v.string(),
        currency: v.string(),
        status: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('UserTable')
      .filter(q => q.eq(q.field('email'), args.userId))
      .first()

    if (!user) {
      throw new Error('User not found')
    }

    const updateData: any = {
      subscription: args.subscription,
      subscriptionDueDate: args.dueDate,
      subscriptionStartDate: Date.now(),
    }

    if (args.paymentDetails) {
      const paymentHistory = user.paymentHistory || []
      paymentHistory.push({
        ...args.paymentDetails,
        paymentDate: Date.now(),
      })
      updateData.paymentHistory = paymentHistory
    }

    await ctx.db.patch(user._id, updateData)
    return await ctx.db.get(user._id)
  },
})

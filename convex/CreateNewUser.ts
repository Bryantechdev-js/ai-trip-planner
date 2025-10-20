import { mutation } from "@/convex/_generated/server";
import { v } from "convex/values";
import { create } from "domain";

export const CreateNewUser = mutation({
    args:{
        name:v.string(),
        email:v.string(),
        imageUrl:v.string()
    },
    handler:async (ctx,args)=>{
        // if user already exist 
        const existingUser = await ctx.db.query("UserTable").filter(q => q.eq(q.field("email"),args.email)).collect();
        if(existingUser.length == 0){
            const userData = {
                name:args.name,
                email:args.email,
                imageUrl:args.imageUrl
            }

            // if not then create a new user
            const result = await ctx.db.insert("UserTable",userData);
            return await ctx.db.get(result);
        }
        return existingUser[0]
    }
})
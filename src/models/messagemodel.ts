import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: { type: String, required: true },
        status: {
            type: String,
            enum: ["sent", "delivered", "seen"],
            default: "sent",
        },

        deleteFor: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        deleteForEveryone: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

export default mongoose.model("Message", messageSchema);

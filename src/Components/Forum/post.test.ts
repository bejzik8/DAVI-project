import { postTemplate } from "./post"

describe("post", () => {
    const mockPost = {
        body: "Hello world",
        title: "Hello",
        context: "",
        master: "",
        replyTo: "",
        mentions: [],
        data: {},
    }
    it("should create a correct post from the post template", () => {
        expect(postTemplate(mockPost)).toEqual(mockPost);
    })

    it("should throw an error if the post is missing a title or body", () => {
       expect(postTemplate({ ...mockPost, title: "" })).toThrow(Error);
       expect(postTemplate({ ...mockPost, body: "" })).toThrow(Error);
    })
})
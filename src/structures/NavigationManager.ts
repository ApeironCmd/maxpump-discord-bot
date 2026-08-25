export class NavigationManager {
    private static navigationStack: Map<string, string[]> = new Map()

    public static pushToStack(userID: string, currentView: string) {
        if (!this.navigationStack.has(userID)) {
            this.navigationStack.set(userID, [])
        }
        
        const stack = this.navigationStack.get(userID)!
        if (stack.length === 0 || stack[stack.length - 1] !== currentView) {
            stack.push(currentView)
        }
    }

    public static popFromStack(userID: string): string | null {
        if (!this.navigationStack.has(userID)) {
            return null
        }
        
        const stack = this.navigationStack.get(userID)!
        if (stack.length <= 1) {
            return null
        }
        
        stack.pop()
        return stack[stack.length - 1]
    }

    public static getCurrentView(userID: string): string | null {
        if (!this.navigationStack.has(userID)) {
            return null
        }
        
        const stack = this.navigationStack.get(userID)!
        return stack.length > 0 ? stack[stack.length - 1] : null
    }

    public static clearStack(userID: string) {
        this.navigationStack.delete(userID)
    }

    public static getBackButtonID(userID: string, fallbackID: string): string {
        const previousView = this.popFromStack(userID)
        
        if (!previousView) {
            return fallbackID
        }

        return previousView
    }

    public static registerViewTransition(userID: string, fromView: string, toView: string) {
        this.pushToStack(userID, fromView)
        this.pushToStack(userID, toView)
    }
}
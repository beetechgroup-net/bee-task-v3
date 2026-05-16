package net.beetechgroup.beetask.interfaceadapters.controllers.publicstats;

import net.beetechgroup.beetask.usecase.publicstats.PublicStatsOutput;

public class PublicStatsControllerMapper {
    public static PublicStatsResponse toPublicStatsResponse(PublicStatsOutput output) {
        return new PublicStatsResponse(
            output.totalUsers(),
            output.totalOrganizations(),
            output.totalCompletedTasks(),
            output.totalTrackedHours()
        );
    }
}
